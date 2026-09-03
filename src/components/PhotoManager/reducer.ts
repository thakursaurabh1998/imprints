export type PictureStatus = 'queued' | 'uploading' | 'ready' | 'failed';

export type PictureItem = {
  filename: string;
  status: PictureStatus;
  error?: string;
};

export type PhotoManagerState = {
  order: string[];
  items: Record<string, PictureItem>;
  cover: string;
  selected: string[];
  lastSelectedIndex: number | null;
  lastRemoved: { filename: string; index: number }[];
};

export function initialPhotoManagerState(
  pictures: string[],
  cover: string,
): PhotoManagerState {
  return {
    order: pictures,
    items: Object.fromEntries(
      pictures.map((filename) => [
        filename,
        { filename, status: 'ready' as const },
      ]),
    ),
    cover,
    selected: [],
    lastSelectedIndex: null,
    lastRemoved: [],
  };
}

export type PhotoManagerAction =
  | { type: 'queue'; filenames: string[] }
  | { type: 'markUploading'; filename: string }
  | { type: 'markReady'; filename: string }
  | { type: 'markFailed'; filename: string; error: string }
  | { type: 'removeSelected' }
  | { type: 'undoRemove' }
  | { type: 'reorder'; order: string[] }
  | { type: 'setCover'; filename: string }
  | { type: 'select'; filename: string; range: boolean }
  | { type: 'clearSelection' };

export function photoManagerReducer(
  state: PhotoManagerState,
  action: PhotoManagerAction,
): PhotoManagerState {
  switch (action.type) {
    case 'queue': {
      const newFilenames = action.filenames.filter(
        (filename) => !(filename in state.items),
      );

      if (newFilenames.length === 0) return state;

      const items = { ...state.items };
      for (const filename of newFilenames) {
        items[filename] = { filename, status: 'queued' };
      }

      return { ...state, order: [...state.order, ...newFilenames], items };
    }

    case 'markUploading':
      return setStatus(state, action.filename, 'uploading');

    case 'markReady':
      return setStatus(state, action.filename, 'ready');

    case 'markFailed':
      return {
        ...state,
        items: {
          ...state.items,
          [action.filename]: {
            filename: action.filename,
            status: 'failed',
            error: action.error,
          },
        },
      };

    case 'removeSelected': {
      const toRemove = new Set(state.selected);
      if (toRemove.size === 0) return state;

      const lastRemoved = state.order
        .map((filename, index) => ({ filename, index }))
        .filter(({ filename }) => toRemove.has(filename));

      const order = state.order.filter((filename) => !toRemove.has(filename));
      const items = { ...state.items };
      for (const filename of Array.from(toRemove)) delete items[filename];

      const cover = toRemove.has(state.cover) ? '' : state.cover;

      return {
        ...state,
        order,
        items,
        cover,
        selected: [],
        lastSelectedIndex: null,
        lastRemoved,
      };
    }

    case 'undoRemove': {
      if (state.lastRemoved.length === 0) return state;

      const order = [...state.order];
      const items = { ...state.items };

      for (const { filename, index } of state.lastRemoved) {
        order.splice(Math.min(index, order.length), 0, filename);
        items[filename] = { filename, status: 'ready' };
      }

      return { ...state, order, items, lastRemoved: [] };
    }

    case 'reorder':
      return { ...state, order: action.order };

    case 'setCover':
      return { ...state, cover: action.filename };

    case 'select': {
      const { filename, range } = action;
      const index = state.order.indexOf(filename);

      if (range && state.lastSelectedIndex !== null) {
        const start = Math.min(state.lastSelectedIndex, index);
        const end = Math.max(state.lastSelectedIndex, index);
        const rangeFilenames = state.order.slice(start, end + 1);

        return {
          ...state,
          selected: Array.from(new Set([...state.selected, ...rangeFilenames])),
          lastSelectedIndex: index,
        };
      }

      const selected = state.selected.includes(filename)
        ? state.selected.filter((f) => f !== filename)
        : [...state.selected, filename];

      return { ...state, selected, lastSelectedIndex: index };
    }

    case 'clearSelection':
      return { ...state, selected: [], lastSelectedIndex: null };

    default:
      return state;
  }
}

function setStatus(
  state: PhotoManagerState,
  filename: string,
  status: PictureStatus,
): PhotoManagerState {
  const existing = state.items[filename];
  if (!existing) return state;

  return {
    ...state,
    items: {
      ...state.items,
      [filename]: { filename, status },
    },
  };
}

export function getReadyOrder(state: PhotoManagerState): string[] {
  return state.order.filter((filename) => state.items[filename]?.status === 'ready');
}

'use client';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Grid } from '@mui/material';
import Image from 'next/image';

import { SortableItem } from './SortableItem';

type SortableGridProps = {
  pictures: string[];
  slug: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (updatedPictures: string[]) => void;
};

export default function SortableImageGrid({
  pictures,
  slug,
  onChange,
}: SortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = pictures.indexOf(active.id as string);
      const newIndex = pictures.indexOf(over?.id as string);

      onChange?.(arrayMove(pictures, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pictures}>
        <Grid container>
          {pictures.map((picture) => (
            <SortableItem key={picture} id={picture}>
              <Grid item>
                <Image
                  height={200}
                  width={200}
                  quality={20}
                  key={picture}
                  src={`/original/images/${slug}/${picture}`}
                  alt="display"
                />
              </Grid>
            </SortableItem>
          ))}
        </Grid>
      </SortableContext>
    </DndContext>
  );
}

export function pushToUniqueList(source: string[], newItems: string[]) {
  const uniqueItemsList = [...source];
  const duplicates: string[] = [];

  for (const item of newItems) {
    if (source.includes(item)) {
      duplicates.push(item);
      continue;
    }
    uniqueItemsList.push(item);
  }

  return { list: uniqueItemsList, duplicates };
}

export function pushToUniqueList(source: string[], newItems: string[]) {
  const uniqueItemsList = [...source];
  let duplicateFound = false;

  for (const item of newItems) {
    if (source.includes(item)) {
      duplicateFound = true;
      continue;
    }
    uniqueItemsList.push(item);
  }

  if (duplicateFound) {
    alert('Duplicate named pictures found');
  }

  return uniqueItemsList;
}

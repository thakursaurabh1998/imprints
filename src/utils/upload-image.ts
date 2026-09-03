export async function uploadImage(
  url: string,
  { arg: imageFile }: { arg: File },
): Promise<{ filename: string }> {
  const formData = new FormData();

  formData.append('file', imageFile);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => '');
    throw new Error(message || `Upload failed with status ${res.status}`);
  }

  return res.json();
}

export async function runWithConcurrency<Item, Result>(
  items: Item[],
  limit: number,
  // eslint-disable-next-line no-unused-vars
  worker: (item: Item, index: number) => Promise<Result>,
): Promise<Result[]> {
  const results: Result[] = new Array(items.length);
  let cursor = 0;

  async function runNext(): Promise<void> {
    const index = cursor++;
    if (index >= items.length) return;

    results[index] = await worker(items[index], index);
    await runNext();
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, runNext));

  return results;
}

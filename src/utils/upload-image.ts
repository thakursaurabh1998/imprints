export function uploadImage(url: string, { arg: imageFile }: { arg: File }) {
  const formData = new FormData();

  formData.append('file', imageFile);

  return fetch(url, {
    method: 'POST',
    body: formData,
  });
}

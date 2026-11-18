// Shrinks a photo in the browser before upload: longest side max 1600px, saved as WebP.
// Keeps uploads small (phone photos are often 3-8 MB) so the public site stays fast.
const MAX = 1600, QUALITY = 0.82;

async function decode(file) {
  try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch (e) {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally { URL.revokeObjectURL(url); }
  }
}

export async function prepareImage(file) {
  if (!file || !/^image\/(jpeg|png|webp|gif|avif|heic|heif)$/.test(file.type)) {
    throw new Error('That file isn’t a photo. Choose a JPG, PNG or WebP image.');
  }
  if (file.size > 40e6) throw new Error('That photo is very large (over 40 MB). Choose a smaller one.');
  let src;
  try { src = await decode(file); } catch (e) { throw new Error('This photo couldn’t be opened. Try saving it as JPG first.'); }
  const w0 = src.width, h0 = src.height, s = Math.min(1, MAX / Math.max(w0, h0));
  const width = Math.round(w0 * s), height = Math.round(h0 * s);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, width, height);
  if (src.close) src.close();
  let blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', QUALITY));
  if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', QUALITY));
  if (!blob) throw new Error('This photo couldn’t be converted. Try another one.');
  return { blob, width, height, bytes: blob.size, originalBytes: file.size, name: file.name.replace(/\.[^.]+$/, '') + (blob.type === 'image/webp' ? '.webp' : '.jpg') };
}

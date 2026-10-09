import type { VercelRequest, VercelResponse } from '@vercel/node';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { file, fileName, folder } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const uploadResponse = await imagekit.upload({
      file,
      fileName: fileName || `img_${Date.now()}`,
      folder: folder || 'emiral',
    });

    res.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
    });
  } catch (err: any) {
    console.error('Server upload error:', err);
    res.status(500).json({ error: 'Failed to upload image', details: err?.message });
  }
}

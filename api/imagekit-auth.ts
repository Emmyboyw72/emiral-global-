import type { VercelRequest, VercelResponse } from '@vercel/node';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT || '',
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json(authParams);
  } catch (err: any) {
    console.error('ImageKit auth error:', err);
    res.status(500).json({ error: 'Failed to generate authentication parameters', details: err?.message });
  }
}

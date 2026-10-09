import express from 'express';
import { createServer as createViteServer } from 'vite';
import ImageKit from 'imagekit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagekit = new ImageKit({
  publicKey: process.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_aOQGKadLZqaZ0LMNr1gYe5/yIdY=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'private_Ck9sVR0wqophZmRUZoiywSGA26s=',
  urlEndpoint: process.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/4d8hhgpvy',
});

async function createServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ImageKit Authentication Route (for client-side IKUpload SDK)
  app.get('/api/imagekit-auth', (req, res) => {
    try {
      const authParams = imagekit.getAuthenticationParameters();
      res.json(authParams);
    } catch (err: any) {
      console.error('ImageKit auth error:', err);
      res.status(500).json({ error: 'Failed to generate authentication parameters', details: err?.message });
    }
  });

  // Direct Server-Side Upload Route (guaranteed fallback for fast, direct upload)
  app.post('/api/upload-image', async (req, res) => {
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
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    const indexHtmlPath = path.resolve(__dirname, 'index.html');
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(indexHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

createServer();

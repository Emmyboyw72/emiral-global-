import ImageKit from 'imagekit-javascript';

const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_aOQGKadLZqaZ0LMNr1gYe5/yIdY=';
const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/4d8hhgpvy';
const authenticationEndpoint = '/api/imagekit-auth';

/**
 * ImageKit instance for client-side operations (upload, transformation, etc.)
 */
export const ik = new ImageKit({
  publicKey,
  urlEndpoint,
});

/**
 * Utility to generate transformed URLs
 */
export const getIKUrl = (path: string, transformations: object = {}) => {
  return ik.url({
    path,
    transformation: [transformations]
  });
};

import { DEV_PORT } from '@/constants';
import urlJoin from 'url-join';

export const getURL = () => {
  // Prefer an explicit site URL from env. In development, fall back to localhost.
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    (process.env.NODE_ENV === 'development'
      ? `http://localhost:${DEV_PORT}/`
      : process.env.NEXT_PUBLIC_VERCEL_URL ??
        `https://barber-apps.vercel.app/`);
  // Make sure to include `https://` when not localhost.
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }

  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export const toSiteURL = (path: string) => {
  const url = getURL();
  return urlJoin(url, path);
};

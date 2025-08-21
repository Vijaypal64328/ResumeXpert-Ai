// Minimal logger utility for backend
const isProd = process.env.NODE_ENV === 'production';

export const info = (...args: any[]) => {
  if (!isProd) console.log(...args);
};

export const debug = (...args: any[]) => {
  if (!isProd) console.debug(...args);
};

export const error = (...args: any[]) => {
  // Always log errors
  console.error(...args);
};

export default { info, debug, error };

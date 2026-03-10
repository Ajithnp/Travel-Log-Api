export const parseCookies = (cookieHeader: string): Record<string, string> => {
  return cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) acc[key.trim()] = decodeURIComponent(value.trim());
    return acc;
  }, {});
};

export function join(parts: string[], separator = '/') {
  const replace = new RegExp(separator + '{1,}', 'g');
  return trimTrailingSlash(parts.join(separator).replace(replace, separator));
}

export function trimTrailingSlash(path: string) {
  return path !== '/' && path.endsWith('/')
    ? path.substring(0, path.length - 1)
    : path;
}

export function isRemotePath(path: string) {
  return (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//')
  );
}

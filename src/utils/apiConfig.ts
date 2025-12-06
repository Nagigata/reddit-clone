export const getMediaUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
};

export const getAvatarUrl = (avatarPath: string | null | undefined): string | undefined => {
  if (!avatarPath) return undefined;
  return getMediaUrl(`media/avatars/${avatarPath}`);
};


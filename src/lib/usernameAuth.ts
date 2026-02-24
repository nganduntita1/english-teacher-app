const INTERNAL_EMAIL_DOMAIN =
  process.env.NEXT_PUBLIC_INTERNAL_EMAIL_DOMAIN || 'internal.yourapp.com';

export const normalizeUsername = (value: string) => value.trim().toLowerCase();

export const isValidUsername = (value: string) =>
  /^[a-z0-9_]{3,20}$/.test(normalizeUsername(value));

export const toInternalEmail = (username: string) => {
  const normalized = normalizeUsername(username);
  return `${normalized}@${INTERNAL_EMAIL_DOMAIN}`;
};

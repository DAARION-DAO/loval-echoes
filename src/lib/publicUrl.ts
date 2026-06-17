/**
 * Canonical public site URL used for branded shareable links
 * (invites, accept-invite tokens, etc.).
 *
 * Resolution order:
 *   1. VITE_PUBLIC_SITE_URL (env override)
 *   2. Hardcoded brand domain (https://1.daarion.city)
 *
 * When running on a *.lovable.app / *.lovableproject.com preview, we still
 * return the branded domain so copied invite links look professional and
 * stay valid for end users.
 */
const DEFAULT_PUBLIC_SITE_URL = 'https://1.daarion.city';

export function getPublicSiteUrl(): string {
  const fromEnv = (import.meta as any).env?.VITE_PUBLIC_SITE_URL as
    | string
    | undefined;
  const raw = (fromEnv && fromEnv.trim()) || DEFAULT_PUBLIC_SITE_URL;
  return raw.replace(/\/+$/, '');
}
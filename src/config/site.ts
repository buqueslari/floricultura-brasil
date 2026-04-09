/** Base da API / site (mesmos paths do exemplo.html) */
export const SITE_ASSET_BASE = 'https://cestasefloresroyal.top'

export function assetUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${SITE_ASSET_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

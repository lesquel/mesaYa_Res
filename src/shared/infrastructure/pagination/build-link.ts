/**
 * Build link helper function.
 *
 * Helper to build link with given query params.
 */

export function buildLink(
  route: string,
  params: Record<string, unknown>,
): string {
  const url = new URL(route, 'https://dummy');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '')
      url.searchParams.set(k, String(v));
  });
  // strip dummy origin
  return url.pathname + (url.search ? url.search : '');
}

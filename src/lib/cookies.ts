// ============================================
// Cookie Utility Helpers
// ============================================

export const cookieHelper = {
  /**
   * Set a cookie with specified name, value, and lifespan in days
   */
  set: (name: string, value: string, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
  },

  /**
   * Get a cookie value by name
   */
  get: (name: string): string | null => {
    return document.cookie.split('; ').reduce((r, c) => {
      const [key, val] = c.split('=');
      return key === name ? decodeURIComponent(val || '') : r;
    }, null as string | null);
  },

  /**
   * Delete a cookie by setting its expiry in the past
   */
  remove: (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`;
  }
};

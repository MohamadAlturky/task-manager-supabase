// Tiny SHA-256 helper for the local-only demo auth.
// NOTE: localStorage + client-side hashing is NOT real security.
// This keeps the password from being stored in plaintext, nothing more.
export async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
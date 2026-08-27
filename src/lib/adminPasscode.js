import { base44 } from "@/api/base44Client";

const SALT = "hageregna-shoes-2026";
const HEX_HASH_RE = /^[0-9a-f]{64}$/;

/**
 * Hash a passcode using SHA-256 with a salt via the Web Crypto API.
 * The passcode is never stored or transmitted in plain text.
 */
export async function hashPasscode(passcode) {
  const encoder = new TextEncoder();
  const normalizedPasscode = String(passcode ?? "").trim();
  const data = encoder.encode(normalizedPasscode + "::" + SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate an admin passcode against the value currently stored in
 * StoreSettings (the single source of truth). Reads the latest record
 * fresh on every call — no caching, no hardcoded fallback.
 *
 * The stored value is either:
 *   - a 64-char SHA-256 hex hash (new passcodes), or
 *   - a legacy plain-text passcode (created before hashing was added).
 * Both are supported so an existing passcode keeps working; any passcode
 * set via Admin Settings is hashed and takes effect immediately.
 */
export async function validateAdminPasscode(input) {
  if (!input) return false;
  try {
    const settings = await base44.entities.StoreSettings.list("-created_date", 1);
    const stored = settings[0]?.admin_passcode_hash;
    if (!stored) return false;
    const trimmedInput = input.trim();
    const trimmedStored = String(stored).trim();
    if (HEX_HASH_RE.test(trimmedStored)) {
      const inputHash = await hashPasscode(trimmedInput);
      return inputHash === trimmedStored;
    }
    // Legacy plain-text passcode — compare directly (migration support).
    return trimmedInput === trimmedStored;
  } catch {
    return false;
  }
}

/**
 * Set a new admin passcode (admin only). Always hashes and stores it in the
 * latest StoreSettings record, taking effect immediately.
 */
export async function setAdminPasscode(newPasscode) {
  const hash = await hashPasscode(newPasscode);
  const settings = await base44.entities.StoreSettings.list("-created_date", 1);
  if (settings.length > 0) {
    await base44.entities.StoreSettings.update(settings[0].id, {
      admin_passcode_hash: hash,
    });
  } else {
    await base44.entities.StoreSettings.create({
      store_name: "Hageregna Shoes",
      admin_passcode_hash: hash,
    });
  }
  return true;
}

/**
 * Whether a passcode is currently configured (never reveals its value).
 */
export async function hasAdminPasscode() {
  try {
    const settings = await base44.entities.StoreSettings.list("-created_date", 1);
    return !!settings[0]?.admin_passcode_hash;
  } catch {
    return false;
  }
}

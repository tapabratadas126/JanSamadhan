import type { CookieOptions, Request } from "express";

function isSecureRequest(req: Request): boolean {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

/**
 * Cookie options for the app's own session cookie.
 *
 * The app is served same-origin (frontend + API on the same domain, both in
 * dev and on Vercel), so `sameSite: "lax"` is correct and — unlike
 * `sameSite: "none"` — does not require `secure: true` to work over plain
 * HTTP in local development. `secure` is still turned on automatically
 * whenever the request actually arrived over HTTPS (including behind
 * Vercel's proxy via `x-forwarded-proto`).
 */
export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}

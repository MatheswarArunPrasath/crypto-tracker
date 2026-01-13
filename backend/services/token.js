import jwt from "jsonwebtoken";

const SECRET = process.env.ALERTS_SIGNING_SECRET || "dev-secret";

// short-ish expiry to limit link abuse; users can always re-subscribe
const EXPIRES_IN = "14d";

export function signUnsubToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyUnsubToken(token) {
  return jwt.verify(token, SECRET);
}

export type AuthSession = {
  token: string;
  expiresAt: number | string;
};

type SessionInvalidationListener = () => void;

let currentSession: AuthSession | null = null;
let expirationTimer: number | null = null;
const invalidationListeners = new Set<SessionInvalidationListener>();

const getExpirationTime = (expiresAt: AuthSession["expiresAt"]) => {
  if (typeof expiresAt === "number") {
    return expiresAt < 1_000_000_000_000 ? expiresAt * 1000 : expiresAt;
  }

  const numericValue = Number(expiresAt);
  if (Number.isFinite(numericValue)) {
    return numericValue < 1_000_000_000_000
      ? numericValue * 1000
      : numericValue;
  }

  return Date.parse(expiresAt);
};

const clearExpirationTimer = () => {
  if (expirationTimer !== null) {
    window.clearTimeout(expirationTimer);
    expirationTimer = null;
  }
};

const notifySessionInvalidated = () => {
  invalidationListeners.forEach((listener) => listener());
};

export const clearAuthSession = () => {
  clearExpirationTimer();
  currentSession = null;
};

export const invalidateAuthSession = () => {
  clearAuthSession();
  notifySessionInvalidated();
};

const scheduleExpiration = () => {
  clearExpirationTimer();
  if (!currentSession) return;

  const expirationTime = getExpirationTime(currentSession.expiresAt);
  const remainingTime = expirationTime - Date.now();

  if (!Number.isFinite(expirationTime) || remainingTime <= 0) {
    invalidateAuthSession();
    return;
  }

  expirationTimer = window.setTimeout(
    () => scheduleExpiration(),
    Math.min(remainingTime, 2_147_483_647),
  );
};

export const setAuthSession = (session: AuthSession) => {
  if (!session.token || !session.expiresAt) {
    throw new Error("Login response did not include a valid session.");
  }

  const expirationTime = getExpirationTime(session.expiresAt);
  if (!Number.isFinite(expirationTime) || expirationTime <= Date.now()) {
    clearAuthSession();
    throw new Error("The login session has already expired. Please sign in again.");
  }

  currentSession = session;
  scheduleExpiration();
};

export const getAuthToken = () => {
  if (!currentSession) {
    invalidateAuthSession();
    throw new Error("Your session has expired. Please sign in again.");
  }

  const expirationTime = getExpirationTime(currentSession.expiresAt);
  if (!Number.isFinite(expirationTime) || Date.now() >= expirationTime) {
    invalidateAuthSession();
    throw new Error("Your session has expired. Please sign in again.");
  }

  return currentSession.token;
};

export const subscribeToSessionInvalidation = (
  listener: SessionInvalidationListener,
) => {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
};

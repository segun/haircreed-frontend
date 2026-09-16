export type AuthSession = {
  accessToken: string;
  expiresAt: number;
};

type SessionInvalidationListener = () => void;

let currentSession: AuthSession | null = null;
let expirationTimer: number | null = null;
let invalidationHandled = false;
const invalidationListeners = new Set<SessionInvalidationListener>();

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
  invalidationHandled = false;
};

export const invalidateAuthSession = () => {
  if (invalidationHandled) return;
  clearAuthSession();
  invalidationHandled = true;
  notifySessionInvalidated();
};

const scheduleExpiration = () => {
  clearExpirationTimer();
  if (!currentSession) return;

  const remainingTime = currentSession.expiresAt - Date.now();

  if (remainingTime <= 0) {
    invalidateAuthSession();
    return;
  }

  expirationTimer = window.setTimeout(
    () => scheduleExpiration(),
    Math.min(remainingTime, 2_147_483_647),
  );
};

export const setAuthSession = (accessToken: string, expiresIn: number) => {
  if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new Error("Login response did not include valid credentials.");
  }

  invalidationHandled = false;
  currentSession = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  scheduleExpiration();
};

export const getAuthToken = () => {
  if (!currentSession) {
    invalidateAuthSession();
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (Date.now() >= currentSession.expiresAt) {
    invalidateAuthSession();
    throw new Error("Your session has expired. Please sign in again.");
  }

  return currentSession.accessToken;
};

export const subscribeToSessionInvalidation = (
  listener: SessionInvalidationListener,
) => {
  invalidationListeners.add(listener);
  return () => {
    invalidationListeners.delete(listener);
  };
};

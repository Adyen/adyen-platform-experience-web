export const ERR_SESSION_EXPIRED: unique symbol = Symbol('Error<SESSION_EXPIRED>');
export const ERR_SESSION_FACTORY_UNAVAILABLE: unique symbol = Symbol('Error<SESSION_FACTORY_UNAVAILABLE>');
export const ERR_SESSION_HTTP_UNAVAILABLE: unique symbol = Symbol('Error<SESSION_HTTP_UNAVAILABLE>');
export const ERR_SESSION_INVALID: unique symbol = Symbol('Error<SESSION_INVALID>');
export const ERR_SESSION_REFRESH_ABORTED: unique symbol = Symbol('Error<SESSION_REFRESH_ABORTED>');
export const EVT_SESSION_EXPIRED_STATE_CHANGE = '_sessionExpiredStateChange';
export const EVT_SESSION_REFRESHING_STATE_CHANGE = '_sessionRefreshingStateChange';

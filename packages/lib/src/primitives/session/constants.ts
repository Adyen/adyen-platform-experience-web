export const ERR_SESSION_EXPIRED: unique symbol = Symbol('Error<SESSION_EXPIRED>');
export const ERR_SESSION_FACTORY_UNAVAILABLE: unique symbol = Symbol('Error<SESSION_FACTORY_UNAVAILABLE>');
export const ERR_SESSION_HTTP_UNAVAILABLE: unique symbol = Symbol('Error<SESSION_HTTP_UNAVAILABLE>');
export const ERR_SESSION_INIT_ABORTED: unique symbol = Symbol('Error<SESSION_INIT_ABORTED>');
export const ERR_SESSION_INVALID: unique symbol = Symbol('Error<SESSION_INVALID>');
export const EVT_SESSION_ACTIVE_STATE_CHANGE = 'session:activeStateChange';
export const EVT_SESSION_INIT_STATE_CHANGE = 'session:initStateChange';

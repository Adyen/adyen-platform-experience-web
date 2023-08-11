const $true = () => true;
export const noop = new Proxy(() => {}, { defineProperty: $true, set: $true });
export const UNWATCH_SIGNAL: unique symbol = Symbol();

export const $createObject = Object.create;
export const $true = () => true;
export const immutableProxyHandlers = { defineProperty: $true, set: $true };

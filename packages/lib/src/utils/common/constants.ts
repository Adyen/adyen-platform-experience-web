export const $createObject = Object.create;
export const $true = () => true;
export const immutableProxyHandlers = { defineProperty: $true, set: $true };
export const EMPTY_ARRAY = Object.freeze([]);
export const EMPTY_OBJECT = Object.freeze($createObject(null));

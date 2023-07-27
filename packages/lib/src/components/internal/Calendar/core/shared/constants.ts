export const call = Function.prototype.bind.bind(Function.prototype.call);
export const createObject = Object.create;
export const $true = () => true;
export const noop = new Proxy(() => {}, { defineProperty: $true, set: $true });

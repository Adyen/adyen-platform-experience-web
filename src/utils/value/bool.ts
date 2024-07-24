import { isBoolean } from './is';

export const boolify = (value?: any, fallbackBoolean = value) => (isBoolean(value) ? value : !!fallbackBoolean);

export const boolOrFalse = (value?: any) => value === true;
export const boolOrTrue = (value?: any) => value !== false;

export const falsify = (_?: any): false => false;
export const truthify = (_?: any): true => true;

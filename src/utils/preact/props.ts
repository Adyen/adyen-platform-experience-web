import { SignalLike } from 'preact';
import { boolify } from '../value/bool';

export const parseBooleanProp = (prop: boolean | SignalLike<boolean | undefined> | undefined): boolean =>
    boolify(prop, (prop as SignalLike<boolean | undefined>)?.value ?? prop);

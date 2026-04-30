import { SignalLike } from 'preact';
import { boolify } from '../../../../../src/utils/value/bool';

export const parseBooleanProp = (prop: boolean | SignalLike<boolean | undefined> | undefined): boolean =>
    boolify(prop, (prop as SignalLike<boolean | undefined>)?.value ?? prop);

import { JSXInternal } from 'preact/src/jsx';
import { boolify } from '../value/bool';

export const parseBooleanProp = (prop: boolean | JSXInternal.SignalLike<boolean | undefined> | undefined): boolean =>
    boolify(prop, (prop as JSXInternal.SignalLike<boolean | undefined>)?.value ?? prop);

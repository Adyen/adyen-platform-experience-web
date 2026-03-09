import type { InjectionKey } from 'vue';
import type { ModalContextValue } from './types';

export const MODAL_CONTEXT_KEY: InjectionKey<ModalContextValue> = Symbol('ModalContext');

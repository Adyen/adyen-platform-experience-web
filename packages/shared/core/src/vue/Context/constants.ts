import type { InjectionKey } from 'vue';
import type { DomainTranslationBinding } from './types';

export const CORE_CONTEXT_KEY = Symbol('CoreContext');
export const COMPONENT_REF_KEY = Symbol('ComponentRef');
export const DOMAIN_TRANSLATION_BINDING_KEY: InjectionKey<DomainTranslationBinding> = Symbol('DomainTranslationBinding');

import { ListBoxState } from './types';

export const INITIAL_STATE = Object.freeze({
    activeIndex: -1,
    activeOption: undefined,
    expanded: false,
    index: -1,
    options: Object.freeze([]),
}) as ListBoxState;

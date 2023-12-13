import { EMPTY_ARRAY } from '@src/utils/common';
import { ListBoxState } from './types';

export const INITIAL_STATE = Object.freeze({
    activeIndex: -1,
    activeOption: undefined,
    expanded: false,
    index: -1,
    options: EMPTY_ARRAY,
}) as ListBoxState;

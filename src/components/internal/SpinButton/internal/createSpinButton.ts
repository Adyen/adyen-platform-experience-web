import contextWithElements from './elements';
import contextWithInteractions from './interactions';
import createSpinButtonContext from './context';
import { EVENT_STATE_NOTIFICATION } from './constants';
import { struct } from '../../../../utils';
import type { SpinButtonRecord, SpinButtonStateChangeCallback } from './types';

const createSpinButton = (signal: AbortSignal) => {
    let onStateChange: SpinButtonStateChangeCallback | undefined = undefined;
    const context = createSpinButtonContext(signal);
    const updateState = () => void onStateChange?.();

    const {
        signal: _,
        addEventListener,
        removeEventListener,
        ...spinButtonRecordProps
    } = Object.getOwnPropertyDescriptors(contextWithInteractions(contextWithElements(context)));

    const setStateChangeCallback = (value: typeof onStateChange | null) => {
        if (onStateChange !== (onStateChange = value ?? undefined)) updateState();
    };

    context.addEventListener(EVENT_STATE_NOTIFICATION, updateState, { signal });

    return struct({
        ...spinButtonRecordProps,
        onStateChange: { set: setStateChangeCallback },
    }) as SpinButtonRecord;
};

export default createSpinButton;

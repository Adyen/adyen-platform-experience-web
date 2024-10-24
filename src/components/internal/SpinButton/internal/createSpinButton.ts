import contextWithElements from './elements';
import contextWithInteractions from './interactions';
import createSpinButtonContext from './context';
import { EVENT_STATE_NOTIFICATION } from './constants';
import { struct } from '../../../../utils';
import type { SpinButtonPushStateCallback, SpinButtonRecord, SpinButtonState } from './types';

const createSpinButton = (signal: AbortSignal) => {
    const context = createSpinButtonContext(signal);

    const {
        signal: _,
        addEventListener,
        removeEventListener,
        ...spinButtonRecordProps
    } = Object.getOwnPropertyDescriptors(contextWithInteractions(contextWithElements(context)));

    const getState = (): Readonly<SpinButtonState> => {
        const { disabled, decrementDisabled, incrementDisabled, leap, max, min, step, value } = context;
        return { disabled, decrementDisabled, incrementDisabled, leap, max, min, step, value } as const;
    };

    const pushState = () => {
        onStatePush?.({ ...currentState });
    };

    const setPushStateCallback = (value: typeof onStatePush | null) => {
        if (onStatePush !== (onStatePush = value ?? undefined)) pushState();
    };

    let currentState = getState();
    let onStatePush: SpinButtonPushStateCallback | undefined = undefined;

    context.addEventListener(
        EVENT_STATE_NOTIFICATION,
        () => {
            currentState = getState();
            pushState();
        },
        { signal }
    );

    return struct({
        ...spinButtonRecordProps,
        onStatePush: { set: setPushStateCallback },
    }) as SpinButtonRecord;
};

export default createSpinButton;

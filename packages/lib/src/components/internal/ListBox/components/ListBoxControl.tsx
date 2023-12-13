import { ForwardedRef, forwardRef } from 'preact/compat';
import { useCallback } from 'preact/hooks';
import { InteractionKeyCode } from '@src/components/types';
import useIdentifierString from '@src/hooks/element/useIdentifierString';
import useReflex from '@src/hooks/useReflex';
import { ListBoxControlProps } from '../types';
import { noop } from '@src/utils/common';

const ListBoxControl = forwardRef(({ expand, listBox, render, state, ...props }: ListBoxControlProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const { activeOption, expanded } = state;
    const ariaControlsIdentifier = useIdentifierString(listBox);
    const buttonRef = useReflex(noop, ref);

    const onClickCapture = useCallback(
        (evt: Event) => {
            expand(!expanded, buttonRef.current ?? undefined);
            evt.preventDefault();
        },
        [expand, expanded]
    );

    const onKeyDownCapture = useCallback(
        (evt: KeyboardEvent) => {
            if (evt.code === InteractionKeyCode.ARROW_DOWN) {
                expand(true, buttonRef.current ?? undefined);
                evt.preventDefault();
                evt.stopPropagation();
            }
        },
        [expand]
    );

    return (
        <button
            {...props}
            ref={buttonRef}
            type="button"
            onClickCapture={onClickCapture}
            onKeyDownCapture={onKeyDownCapture}
            aria-haspopup="listbox"
            aria-expanded={expanded}
            aria-controls={ariaControlsIdentifier}
        >
            {render(state) ?? activeOption}
        </button>
    );
});

export default ListBoxControl;

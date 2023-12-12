import { ComponentChild } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import { MutableRef } from 'preact/hooks';
import useListBox from './hooks/useListBox';
import useListBoxPrimitives from './hooks/useListBoxPrimitives';

type UncontrolledProps = Pick<HTMLAttributes<any>, 'className' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'>;

type UseListBox<T extends any = any> = ReturnType<typeof useListBox<T>>;
type UseListBoxPrimitives<T extends any = any> = ReturnType<typeof useListBoxPrimitives<T>>;

export type UseListBoxListenersContext<T extends any = any> = UseListBoxPrimitives<T> & { focusRestorationTarget: MutableRef<HTMLElement | null> };

export type ListBoxProps<T extends any = any> = UncontrolledProps &
    Pick<UseListBox<T>, 'cursor' | 'listeners' | 'state'> & {
        listClassName?: UncontrolledProps['className'];
        optionClassName?: UncontrolledProps['className'];
        render: (option: T, index: number, state: ListBoxState<T>) => ComponentChild;
    };

export type ListBoxControlProps<T extends any = any> = UncontrolledProps &
    Pick<UseListBox<T>, 'expand' | 'state'> & {
        listBox: UseListBox<T>['ref'];
        onSelection: (option: T) => any;
        render: (state: ListBoxState<T>) => ComponentChild;
    };

export type ListBoxState<T extends any = any> = {
    activeIndex: number;
    activeOption: T | undefined;
    expanded: boolean;
    index: number;
    options: readonly T[];
};

export type ListBoxStateDispatchAction =
    | { type: 'COMMIT' | 'ESCAPE' | 'RESET' }
    | { type: 'EXPAND'; arg?: boolean }
    | { type: 'NEXT'; arg?: number }
    | { type: 'PATCH'; arg: ListBoxState };

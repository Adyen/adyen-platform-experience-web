import classNames from 'classnames';
import { forwardRef, TargetedEvent } from 'preact/compat';
import { JSX } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import InputBase from '../FormFields/InputBase';
import { InputBaseProps } from '../FormFields/types';
import { debounce } from '../../external/CapitalOffer/components/utils/utils';
import './SearchBar.scss';
import Icon from '../Icon';
import Button from '../Button';
import { ButtonVariant } from '../Button/types';

export type SearchBarProps = {
    value?: string;
    placeholder?: string;
    className?: string;
    debounceTime?: number;
    onInput?: (value: string) => void;
    onFocus?: (event: JSX.TargetedEvent<HTMLInputElement>) => void;
    onBlur?: (event: JSX.TargetedEvent<HTMLInputElement>) => void;
    onClear?: () => void;
    autoFocus?: boolean;
};

export type SearchBarRef = {
    focus: () => void;
};

const DEFAULT_DEBOUNCE_TIME = 300;

export const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(
    ({ value, placeholder, className, debounceTime = DEFAULT_DEBOUNCE_TIME, onInput, onFocus, onBlur, onClear, autoFocus = false }, ref) => {
        const { i18n } = useCoreContext();
        const [searchTerm, setSearchTerm] = useState(value ?? '');
        const inputRef = useRef<HTMLInputElement | null>(null);

        const debouncedOnInput = useMemo(
            () =>
                debounce((nextValue: string) => {
                    onInput?.(nextValue);
                }, debounceTime),
            [onInput, debounceTime]
        );

        const handleFocus = useCallback(
            (event: JSX.TargetedEvent<HTMLInputElement>) => {
                onFocus?.(event);
            },
            [onFocus]
        );

        const handleBlur = useCallback(
            (event: JSX.TargetedEvent<HTMLInputElement>) => {
                onBlur?.(event);
            },
            [onBlur]
        );

        const clearSearch = useCallback(() => {
            setSearchTerm('');
            debouncedOnInput.cancel();
            onClear?.();
            onInput?.('');
        }, [debouncedOnInput, onClear, onInput]);

        const handleInput: InputBaseProps['onInput'] = useCallback(
            (event: TargetedEvent<HTMLInputElement, Event>) => {
                const nextValue = (event.currentTarget as HTMLInputElement).value;
                setSearchTerm(nextValue);
                debouncedOnInput(nextValue);
            },
            [debouncedOnInput]
        );

        const focus = useCallback(() => {
            inputRef.current?.focus();
        }, []);

        useEffect(() => {
            if (value !== undefined) {
                setSearchTerm(value);
            }
        }, [value]);

        useEffect(() => {
            if (autoFocus) {
                focus();
            }
        }, [autoFocus, focus]);

        useEffect(() => () => debouncedOnInput.cancel(), [debouncedOnInput]);

        const clearButtonAriaLabel = i18n.get('common.inputs.search.clearSearch');

        const shouldShowClearButton = Boolean(searchTerm);

        const iconBefore = useMemo(() => <Icon name="search" />, []);
        const iconAfter = useMemo(
            () => (
                <Button aria-label={clearButtonAriaLabel} variant={ButtonVariant.TERTIARY} onClick={clearSearch}>
                    <Icon name="cross-circle-fill" />
                </Button>
            ),
            [clearSearch, clearButtonAriaLabel]
        );

        const combinedInputProps: InputBaseProps & Record<string, unknown> = useMemo(() => {
            const props: InputBaseProps & Record<string, unknown> = {
                type: 'search',
                value: searchTerm,
                placeholder,
                onInput: handleInput,
                onFocusHandler: handleFocus,
                onBlur: handleBlur,
                className: classNames('adyen-pe-search-bar__input'),
                iconBefore,
                iconAfter: shouldShowClearButton ? iconAfter : undefined,
                iconAfterInteractive: shouldShowClearButton,
                ...(autoFocus ? { autoFocus: true } : {}),
            };

            return props;
        }, [handleBlur, handleFocus, handleInput, iconAfter, iconBefore, placeholder, searchTerm, shouldShowClearButton, autoFocus]);

        return (
            <div className={classNames('adyen-pe-search-bar', className)}>
                <div className="adyen-pe-search-bar__field">
                    <InputBase {...combinedInputProps} ref={inputRef} />
                </div>
            </div>
        );
    }
);

SearchBar.displayName = 'SearchBar';

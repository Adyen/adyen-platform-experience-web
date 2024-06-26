import { getModifierClasses } from '../../../../utils/preact';
import { useCallback, useMemo } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';

const useButton = (
    className: string,
    classNameModifiers: string[],
    defaultClassName: string,
    disabled: boolean,
    onClick?: JSXInternal.MouseEventHandler<HTMLButtonElement>
) => {
    const click = useCallback(
        (e: any) => {
            e.preventDefault();

            if (!disabled) {
                onClick?.(e);
            }
        },
        [disabled, onClick]
    );

    const classes = useMemo(
        () => getModifierClasses(defaultClassName, classNameModifiers, [defaultClassName, className]),
        [classNameModifiers, className]
    );

    return { classes, click };
};

export default useButton;

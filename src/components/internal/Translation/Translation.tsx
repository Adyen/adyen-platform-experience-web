import useCoreContext from '../../../core/Context/useCoreContext';
import { ComponentChildren, Fragment, FunctionalComponent } from 'preact';
import { TranslationFill, TranslationFillFunc, TranslationProps } from './types';
import { isFunction, uniqueId } from '../../../utils';
import { useMemo } from 'preact/hooks';

const normalizeFill = (fill: TranslationFill): TranslationFillFunc => {
    return isFunction(fill) ? fill : () => fill;
};

export const Translation: FunctionalComponent<TranslationProps> = ({ count, defaultFill, fills, translationKey }) => {
    const { i18n } = useCoreContext();

    const getFill = useMemo<(translationKey: string, index: number, repetitionIndex: number) => ComponentChildren>(() => {
        const _defaultFill = normalizeFill(defaultFill);

        if (fills !== undefined) {
            return (translationKey, index, repetitionIndex) => {
                const keysByPriority = [`${translationKey}[${repetitionIndex}]`, translationKey, `[${index}]`, index];

                for (const key of keysByPriority) {
                    const fill = normalizeFill((fills as any)[key])(translationKey);
                    if (fill != undefined) return fill;
                }

                return _defaultFill(translationKey);
            };
        }

        return _defaultFill;
    }, [fills, defaultFill]);

    return useMemo(() => {
        const fills: ComponentChildren[] = [];
        const placeholder = uniqueId('translation');

        const values = (...args: Parameters<typeof getFill>) => {
            fills.push(getFill(...args) ?? null);
            return placeholder;
        };

        const [firstFragment, ...restFragments] = i18n.get(translationKey, { count, values }).split(placeholder);

        return (
            <>
                {firstFragment}
                {restFragments.map((fragment, index) => (
                    <Fragment key={`${placeholder}__${index}`}>
                        {fills[index]}
                        {fragment}
                    </Fragment>
                ))}
            </>
        );
    }, [i18n, count, getFill, translationKey]);
};

export default Translation;

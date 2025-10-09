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

    const getFill = useMemo<TranslationFillFunc>(() => {
        const _defaultFill = normalizeFill(defaultFill);

        if (fills !== undefined) {
            return (...args) => {
                const [placeholder, index] = args;

                for (const lookupProperty of [placeholder, index]) {
                    const fill = normalizeFill((fills as any)[lookupProperty])(...args);
                    if (fill != undefined) return fill;
                }

                return _defaultFill(...args);
            };
        }

        return _defaultFill;
    }, [fills, defaultFill]);

    return useMemo(() => {
        const fills: ComponentChildren[] = [];
        const placeholderFill = uniqueId('translation');

        const values = (...args: Parameters<TranslationFillFunc>) => {
            fills.push(getFill(...args) ?? null);
            return placeholderFill;
        };

        const [firstFragment, ...restFragments] = i18n.get(translationKey, { count, values }).split(placeholderFill);

        return (
            <>
                {firstFragment}
                {restFragments.map((fragment, index) => (
                    <Fragment key={`${placeholderFill}__${index}`}>
                        {fills[index]}
                        {fragment}
                    </Fragment>
                ))}
            </>
        );
    }, [i18n, count, getFill, translationKey]);
};

export default Translation;

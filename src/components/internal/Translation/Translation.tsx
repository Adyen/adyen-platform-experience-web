import useCoreContext from '../../../core/Context/useCoreContext';
import { ComponentChildren, Fragment, FunctionalComponent } from 'preact';
import { TranslationFill, TranslationFillFunc, TranslationProps } from './types';
import { isFunction, uniqueId } from '../../../utils';
import { useCallback, useMemo } from 'preact/hooks';

const normalizeTranslationFill = (fill: TranslationFill): TranslationFillFunc => {
    return isFunction(fill) ? fill : () => fill;
};

export const Translation: FunctionalComponent<TranslationProps> = ({ count, defaultFill, fills, translationKey }) => {
    const { i18n } = useCoreContext();

    const getTranslationFill = useMemo<(translationKey: string, index: number, repetitionIndex: number) => ComponentChildren>(() => {
        const _defaultFill = normalizeTranslationFill(defaultFill);

        if (fills !== undefined) {
            return (translationKey, index, repetitionIndex) => {
                const keysByPriority = [`${translationKey}[${repetitionIndex}]`, translationKey, `[${index}]`, index];

                for (const key of keysByPriority) {
                    const fill = normalizeTranslationFill((fills as any)[key])(translationKey);
                    if (fill != undefined) return fill;
                }

                return _defaultFill(translationKey);
            };
        }

        return _defaultFill;
    }, [fills, defaultFill]);

    const translationPlaceholder = useMemo(() => uniqueId('translation'), []);
    const translationFills = useMemo<ComponentChildren[]>(() => [], [getTranslationFill]);

    const translationFillValue = useCallback<(translationKey: string, index: number, repetitionIndex: number) => string>(
        (...args) => {
            translationFills.push(getTranslationFill(...args) ?? null);
            return translationPlaceholder;
        },
        [getTranslationFill, translationFills, translationPlaceholder]
    );

    const [firstTranslationFragment, ...restTranslationFragments] = useMemo(() => {
        const translatedString = i18n.get(translationKey, { count, values: translationFillValue });
        return translatedString.split(translationPlaceholder);
    }, [i18n, count, translationFillValue, translationKey, translationPlaceholder]);

    return (
        <>
            {firstTranslationFragment}
            {restTranslationFragments.map((translationFragment, index) => (
                <Fragment key={`${translationPlaceholder}__${index}`}>
                    {translationFills[index]}
                    {translationFragment}
                </Fragment>
            ))}
        </>
    );
};

export default Translation;

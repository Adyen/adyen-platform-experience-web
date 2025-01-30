import useCoreContext from '../../../core/Context/useCoreContext';
import { ComponentChildren, FunctionalComponent } from 'preact';
import { isPlainObject, uniqueId } from '../../../utils';
import { normalizeTranslationFill } from './utils';
import { useCallback, useMemo } from 'preact/hooks';
import { TranslationProps } from './types';

export const Translation: FunctionalComponent<TranslationProps> = ({ count, defaultFill, fills, translationKey }) => {
    const placeholder = useMemo(() => uniqueId('translation'), []);
    const { i18n } = useCoreContext();

    const getTranslationFill = useMemo(() => {
        const _defaultFill = normalizeTranslationFill(defaultFill);

        if (isPlainObject(fills)) {
            return (...keysByPriority: string[]): ComponentChildren => {
                for (const key of keysByPriority) {
                    const fill = normalizeTranslationFill(fills[key]);
                    if (fill != undefined) return fill;
                }
                return _defaultFill;
            };
        }

        return () => _defaultFill;
    }, [fills, defaultFill]);

    const translationFills = useMemo<ComponentChildren[]>(() => [], [getTranslationFill]);

    const values = useCallback(
        (key: string, index: number, repetitionIndex: number) => {
            translationFills.push(getTranslationFill(`${key}[${repetitionIndex}]`, key, `[${index}]`) ?? null);
            return placeholder;
        },
        [getTranslationFill, placeholder, translationFills]
    );

    const translation = useMemo(() => i18n.get(translationKey, { count, values }), [translationKey, count, values]);

    return useMemo(() => {
        const [firstFragment, ...restFragments] = translation.split(placeholder);
        return (
            <>
                {firstFragment}
                {restFragments.length > 0 &&
                    restFragments.map((fragment, index) => (
                        <>
                            {translationFills[index]}
                            {fragment}
                        </>
                    ))}
            </>
        );
    }, [placeholder, translation, translationFills]);
};

export default Translation;

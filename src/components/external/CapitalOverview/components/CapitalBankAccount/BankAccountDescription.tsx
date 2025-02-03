import { useMemo } from 'preact/hooks';
import { FunctionalComponent, h } from 'preact';
import CopyText from '../../../../internal/CopyText/CopyText';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { TranslationKey } from '../../../../../translations';

type _ClassNameProp = h.JSX.HTMLAttributes['className'];

export type BankAccountDescriptionProps = {
    className?: _ClassNameProp;
    contentClassName?: _ClassNameProp;
    copyTextConfig?: Partial<Pick<Parameters<typeof CopyText>[0], 'buttonLabel' | 'textToCopy'>>;
    label: TranslationKey;
    labelClassName?: _ClassNameProp;
    value?: string;
};

export const BankAccountDescription: FunctionalComponent<BankAccountDescriptionProps> = ({
    className,
    contentClassName,
    copyTextConfig,
    label,
    labelClassName,
    value,
}) => {
    const { i18n } = useCoreContext();

    const isCopyText = useMemo(() => !!copyTextConfig, [copyTextConfig]);
    const valueText = useMemo(() => copyTextConfig?.buttonLabel ?? value, [copyTextConfig, value]);
    const textToCopy = useMemo(() => copyTextConfig?.textToCopy ?? valueText, [copyTextConfig, valueText]);

    return valueText == undefined ? null : (
        <div className={className}>
            <dt className={labelClassName}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                    {i18n.get(label)}
                </Typography>
            </dt>
            <dd className={contentClassName}>
                {isCopyText ? (
                    <CopyText buttonLabel={valueText} textToCopy={textToCopy!} showCopyTextTooltip={false} type="Text" />
                ) : (
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                        {valueText}
                    </Typography>
                )}
            </dd>
        </div>
    );
};

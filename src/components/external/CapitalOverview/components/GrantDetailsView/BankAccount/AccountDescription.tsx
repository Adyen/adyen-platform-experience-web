import { useMemo } from 'preact/hooks';
import { FunctionalComponent, h } from 'preact';
import CopyText from '../../../../../internal/CopyText/CopyText';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import { TranslationKey } from '../../../../../../translations';

type _ClassNameProp = h.JSX.HTMLAttributes['className'];

export type BankAccountDescriptionProps = {
    className?: _ClassNameProp;
    content?: string;
    contentClassName?: _ClassNameProp;
    copyTextConfig?: Partial<Pick<Parameters<typeof CopyText>[0], 'buttonLabel' | 'textToCopy'>>;
    label: TranslationKey;
    labelClassName?: _ClassNameProp;
};

export const AccountDescription: FunctionalComponent<BankAccountDescriptionProps> = ({
    className,
    content,
    contentClassName,
    copyTextConfig,
    label,
    labelClassName,
}) => {
    const { i18n } = useCoreContext();

    const isCopyText = useMemo(() => !!copyTextConfig, [copyTextConfig]);
    const textContent = useMemo(() => copyTextConfig?.buttonLabel ?? content, [copyTextConfig, content]);
    const textToCopy = useMemo(() => copyTextConfig?.textToCopy ?? textContent, [copyTextConfig, textContent]);

    return textContent == undefined ? null : (
        <div className={className}>
            <dt className={labelClassName}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                    {i18n.get(label)}
                </Typography>
            </dt>
            <dd className={contentClassName}>
                {isCopyText ? (
                    <CopyText buttonLabel={textContent} textToCopy={textToCopy!} showCopyTextTooltip={false} type="Text" />
                ) : (
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                        {textContent}
                    </Typography>
                )}
            </dd>
        </div>
    );
};

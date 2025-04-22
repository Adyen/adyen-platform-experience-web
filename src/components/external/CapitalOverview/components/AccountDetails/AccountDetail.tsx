import { FunctionalComponent, h } from 'preact';
import CopyText from '../../../../internal/CopyText/CopyText';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { TranslationKey } from '../../../../../translations';

type _ClassNameProp = h.JSX.HTMLAttributes['className'];

export type AccountDetailProps = {
    className?: _ClassNameProp;
    content: string;
    contentClassName?: _ClassNameProp;
    textToCopy?: string;
    label: TranslationKey;
    labelClassName?: _ClassNameProp;
};

export const AccountDetail: FunctionalComponent<AccountDetailProps> = ({
    className,
    content,
    contentClassName,
    textToCopy,
    label,
    labelClassName,
}) => {
    const { i18n } = useCoreContext();
    return (
        <div className={className}>
            <dt className={labelClassName}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                    {i18n.get(label)}
                </Typography>
            </dt>
            <dd className={contentClassName}>
                {textToCopy ? (
                    <CopyText buttonLabel={content} textToCopy={textToCopy} showCopyTextTooltip={false} type={'Text' as const} />
                ) : (
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                        {content}
                    </Typography>
                )}
            </dd>
        </div>
    );
};

import cx from 'classnames';
import { HTMLProps } from 'preact/compat';
import { TranslationKey } from '../../../translations';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { Tooltip } from '../Tooltip/Tooltip';
import { ButtonVariant } from '../Button/types';
import Button from '../Button';
import Icon from '../Icon';
import './CopyText.scss';

type CopyTextProps = {
    copyButtonAriaLabelKey?: TranslationKey;
    isHovered?: boolean;
    showCopyTextTooltip?: boolean;
    type?: 'Link' | 'Text' | 'Default';
    textToCopy: string;
    visibleText?: string;
    onCopyText?: () => void;
} & HTMLProps<HTMLSpanElement>;

const BASE_CLASSNAME = 'adyen-pe-copy-text';

const classes = {
    base: BASE_CLASSNAME,
    container: BASE_CLASSNAME + '__container',
    containerInformation: BASE_CLASSNAME + '__container--information',
    icon: BASE_CLASSNAME + '__icon',
    iconInformation: BASE_CLASSNAME + '__icon--information',
    information: BASE_CLASSNAME + '__information',
    label: BASE_CLASSNAME + '__label',
    text: BASE_CLASSNAME + '__text',
};

const CopyText = ({
    copyButtonAriaLabelKey,
    isHovered,
    textToCopy,
    visibleText,
    onCopyText,
    showCopyTextTooltip = true,
    type = 'Link',
    ...restProps
}: CopyTextProps) => {
    const { i18n } = useCoreContext();
    const [isCopied, setIsCopied] = useState(false);
    const resetIsCopied = useCallback(() => setIsCopied(false), []);
    const copyButtonLabel = useMemo(() => i18n.get(copyButtonAriaLabelKey ?? 'common.actions.copy.labels.default'), [i18n, copyButtonAriaLabelKey]);

    const onClick = useCallback(async () => {
        if (textToCopy) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                setIsCopied(true);
                onCopyText && onCopyText();
            } catch (e) {
                console.error(e);
            }
        }
    }, [textToCopy, onCopyText]);

    const visibleTextToCopy = useMemo(
        () => (
            <span
                className={cx({
                    [classes.label]: type !== 'Default',
                    [classes.information]: type === 'Link',
                    [classes.text]: type === 'Text',
                })}
            >
                {visibleText || textToCopy}
            </span>
        ),
        [visibleText, textToCopy, type]
    );

    return (
        <span
            className={cx(classes.container, {
                [classes.containerInformation]: type === 'Link',
            })}
            {...restProps}
        >
            {showCopyTextTooltip ? (
                <Tooltip content={textToCopy} isContainerHovered={isHovered}>
                    {visibleTextToCopy}
                </Tooltip>
            ) : (
                visibleTextToCopy
            )}

            <Tooltip content={i18n.get(isCopied ? 'common.actions.copy.labels.done' : 'common.actions.copy.labels.default')}>
                <Button
                    variant={ButtonVariant.TERTIARY}
                    className={classes.base}
                    onClick={onClick}
                    onBlur={resetIsCopied}
                    onMouseLeaveCapture={resetIsCopied}
                    aria-label={copyButtonLabel}
                    data-testid="copyText"
                >
                    <div
                        className={cx(classes.icon, {
                            [classes.iconInformation]: type === 'Link',
                        })}
                    >
                        <Icon name={'copy'} data-testid={'copy-icon'} />
                    </div>
                </Button>
            </Tooltip>

            <div className="adyen-pe-visually-hidden" aria-atomic="true" aria-live="polite">
                {isCopied && i18n.get('common.actions.copy.labels.done')}
            </div>
        </span>
    );
};

export default CopyText;

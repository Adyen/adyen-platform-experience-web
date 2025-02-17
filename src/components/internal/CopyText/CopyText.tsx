import cx from 'classnames';
import { useCallback, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import Icon from '../Icon';
import { Tooltip } from '../Tooltip/Tooltip';
import './CopyText.scss';

const CopyText = ({
    textToCopy,
    isHovered,
    buttonLabel,
    showCopyTextTooltip = true,
    type = 'Link',
}: {
    textToCopy: string;
    isHovered?: boolean;
    buttonLabel?: string;
    showCopyTextTooltip?: boolean;
    type?: 'Link' | 'Text' | 'Default';
}) => {
    const { i18n } = useCoreContext();

    const [tooltipLabel, setTooltipLabel] = useState(i18n.get('copy'));

    const onClick = useCallback(async () => {
        if (textToCopy) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                setTooltipLabel(i18n.get('copied'));
            } catch (e) {
                console.log(e);
            }
        }
    }, [i18n, textToCopy]);

    const resetTooltipLabel = useCallback(() => {
        setTooltipLabel(i18n.get('copy'));
    }, [i18n]);

    return (
        <span
            className={cx('adyen-pe-copy-text__container', {
                ['adyen-pe-copy-text__container--information']: type === 'Link',
            })}
        >
            {showCopyTextTooltip ? (
                <Tooltip content={textToCopy} isContainerHovered={isHovered}>
                    <span
                        className={cx({
                            ['adyen-pe-copy-text__label']: type !== 'Default',
                            ['adyen-pe-copy-text__information']: type === 'Link',
                            ['adyen-pe-copy-text__text']: type === 'Text',
                        })}
                    >
                        {buttonLabel || textToCopy}
                    </span>
                </Tooltip>
            ) : (
                <span
                    className={cx({
                        ['adyen-pe-copy-text__label']: type !== 'Default',
                        ['adyen-pe-copy-text__information']: type === 'Link',
                        ['adyen-pe-copy-text__text']: type === 'Text',
                    })}
                >
                    {buttonLabel || textToCopy}
                </span>
            )}
            <Tooltip content={tooltipLabel}>
                <Button
                    variant={ButtonVariant.TERTIARY}
                    className="adyen-pe-copy-text"
                    onClick={onClick}
                    onBlur={resetTooltipLabel}
                    onMouseLeaveCapture={resetTooltipLabel}
                >
                    <div
                        className={cx('adyen-pe-copy-text__icon', {
                            ['adyen-pe-copy-text__icon--information']: type === 'Link',
                        })}
                    >
                        <Icon name={'copy'} data-testid={'copy-icon'} />
                    </div>
                </Button>
            </Tooltip>
        </span>
    );
};

export default CopyText;

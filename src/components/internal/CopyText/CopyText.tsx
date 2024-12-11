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
    type = 'Link',
}: {
    textToCopy: string;
    isHovered?: boolean;
    buttonLabel?: string;
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
        <div
            className={cx('adyen-pe-copy-text__container', {
                ['adyen-pe-copy-text__container--information']: type === 'Link',
            })}
        >
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
                        <Icon name={'copy'} />
                    </div>
                </Button>
            </Tooltip>
        </div>
    );
};

export default CopyText;

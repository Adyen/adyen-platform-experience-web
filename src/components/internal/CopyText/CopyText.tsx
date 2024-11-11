import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import { useCallback, useState } from 'preact/hooks';
import { Tooltip } from '../Tooltip/Tooltip';
import './CopyText.scss';
import cx from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import Icon from '../Icon';

const CopyText = ({
    textToCopy,
    isHovered,
    visibleLabel,
    type = 'Link',
}: {
    textToCopy: string;
    isHovered?: boolean;
    visibleLabel?: string;
    type?: 'Link' | 'Text';
}) => {
    const { i18n } = useCoreContext();

    const [iconTooltipLabel, setIconTooltipLabel] = useState(i18n.get('copy'));

    const onClick = useCallback(async () => {
        if (textToCopy) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                setIconTooltipLabel(i18n.get('copied'));
            } catch (e) {
                console.log(e);
            }
        }
    }, [i18n, textToCopy]);

    const resetTooltipLabel = useCallback(() => {
        setIconTooltipLabel(i18n.get('copy'));
    }, [i18n]);

    return (
        <div
            className={cx('adyen-pe-copy-text__container', {
                ['adyen-pe-copy-text__container--information']: type === 'Link',
            })}
        >
            <Tooltip content={textToCopy} isContainerHovered={isHovered}>
                <span
                    className={cx('adyen-pe-copy-text__label', {
                        ['adyen-pe-copy-text__information']: type === 'Link',
                        ['adyen-pe-copy-text__text']: type === 'Text',
                    })}
                >
                    {visibleLabel || textToCopy}
                </span>
            </Tooltip>
            <Tooltip content={iconTooltipLabel}>
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

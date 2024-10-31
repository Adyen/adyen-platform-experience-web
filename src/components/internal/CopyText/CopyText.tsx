import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import { useCallback, useState } from 'preact/hooks';
import { Tooltip } from '../Tooltip/Tooltip';
import Copy from '../SVGIcons/Copy';
import './CopyText.scss';
import cx from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';

const CopyText = ({ text, isHovered, label, type = 'Link' }: { text: string; isHovered?: boolean; label?: string; type?: 'Link' | 'Text' }) => {
    const [tooltipLabel, setTooltipLabel] = useState(text);
    const { i18n } = useCoreContext();

    const onClick = useCallback(async () => {
        if (text) {
            try {
                await navigator.clipboard.writeText(text);
                setTooltipLabel(i18n.get('copied'));
            } catch (e) {
                console.log(e);
            }
        }
    }, [i18n, text]);

    const resetTooltipLabel = useCallback(() => {
        setTooltipLabel(text);
    }, [setTooltipLabel, text]);

    return (
        <Button
            variant={ButtonVariant.TERTIARY}
            className={'adyen-pe-copy-text'}
            onClick={onClick}
            onBlur={resetTooltipLabel}
            onMouseLeaveCapture={resetTooltipLabel}
        >
            <Tooltip content={tooltipLabel} isContainerHovered={isHovered}>
                <div className={'adyen-pe-copy-text__container'}>
                    <span
                        className={cx({
                            ['adyen-pe-copy-text__information']: type === 'Link',
                            ['adyen-pe-copy-text__text']: type === 'Text',
                        })}
                    >
                        {label || text}
                    </span>
                    <Copy fill={type === 'Link' ? '#0070f5' : undefined} />
                </div>
            </Tooltip>
        </Button>
    );
};

export default CopyText;

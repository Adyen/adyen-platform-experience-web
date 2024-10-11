import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import { useCallback, useState } from 'preact/hooks';
import Icon from '../Icon';
import { Tooltip } from '../Tooltip/Tooltip';
import './CopyText.scss';

const CopyText = ({ text }: { text: string }) => {
    const [tooltipLabel, setTooltipLabel] = useState(text);

    const onClick = useCallback(async () => {
        if (text) {
            try {
                await navigator.clipboard.writeText(text);
                setTooltipLabel('Copied');
            } catch (e) {
                console.log(e);
            }
        }
    }, [text]);

    const resetTooltipLabel = useCallback(() => {
        setTooltipLabel(text);
    }, [setTooltipLabel, text]);

    return (
        <Tooltip content={tooltipLabel}>
            <Button
                variant={ButtonVariant.TERTIARY}
                className={'adyen-pe-copy-text'}
                onClick={onClick}
                onBlur={resetTooltipLabel}
                onMouseLeaveCapture={resetTooltipLabel}
            >
                <span className={'adyen-pe-copy-text__information'}>{text}</span>
                <Icon name={'copy'} color={'#0070f5'} />
            </Button>
        </Tooltip>
    );
};

export default CopyText;

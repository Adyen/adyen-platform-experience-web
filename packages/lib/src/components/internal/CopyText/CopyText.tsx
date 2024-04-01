import Button from '@src/components/internal/Button';
import { ButtonVariant } from '@src/components/internal/Button/types';
import { useCallback, useState } from 'preact/hooks';
import { Tooltip } from '@src/components/internal/Tooltip/Tooltip';
import Copy from '@src/components/internal/SVGIcons/Copy';
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
                className={'adyen-fp-copy-text'}
                onClick={onClick}
                onBlur={resetTooltipLabel}
                onMouseLeaveCapture={resetTooltipLabel}
            >
                <span className={'adyen-fp-copy-text__information'}>{text}</span>
                <Copy fill={'#0070f5'} />
            </Button>
        </Tooltip>
    );
};

export default CopyText;

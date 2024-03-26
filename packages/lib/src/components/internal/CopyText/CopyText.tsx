import { useCallback } from 'preact/hooks';
import { Tooltip } from '@src/components/internal/Tooltip/Tooltip';
import Copy from '@src/components/internal/SVGIcons/Copy';
import './CopyText.scss';

const CopyText = ({ text }: { text: string }) => {
    const onClick = useCallback(async () => {
        if (text) {
            try {
                await navigator.clipboard.writeText(text);
            } catch (e) {
                console.log(e);
            }
        }
    }, [text]);

    return (
        <div className={'adyen-fp-copy-text'} onClick={onClick}>
            <Tooltip content={text}>
                <span className={'adyen-fp-copy-text__information'} readOnly={true}>
                    {text}
                </span>
            </Tooltip>
            <Copy fill={'#0070f5'} />
        </div>
    );
};

export default CopyText;

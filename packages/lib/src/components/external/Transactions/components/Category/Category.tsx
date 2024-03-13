import { CategoryProp } from '@src/components';
import Popover from '@src/components/internal/Popover/Popover';
import useCoreContext from '@src/core/Context/useCoreContext';
import { TranslationKey } from '@src/core/Localization/types';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import { Ref, useState } from 'preact/hooks';

function Category({ value }: CategoryProp) {
    const { i18n } = useCoreContext();
    const tooltipRef = useUniqueIdentifier() as Ref<Element | null>;
    const [showTooltip, setShowTooltip] = useState(false);
    const mouseOver = () => {
        if (!showTooltip) {
            setShowTooltip(true);
        }
    };
    const mouseOut = () => {
        if (showTooltip) {
            setShowTooltip(false);
        }
    };

    return (
        <>
            <div ref={tooltipRef as Ref<HTMLDivElement | null>} onMouseEnter={mouseOver} onMouseLeave={mouseOut}>
                {value}
            </div>
            {showTooltip && (
                <Popover targetElement={tooltipRef as Ref<HTMLDivElement | null>} open={showTooltip}>
                    <span>{i18n.get(`tooltip.${value.toLowerCase()}` as TranslationKey)}</span>
                </Popover>
            )}
        </>
    );
}

export default Category;

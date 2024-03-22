import { CategoryProp } from '@src/components';
import { Tooltip } from '@src/components/internal/Tooltip/Tooltip';
import useCoreContext from '@src/core/Context/useCoreContext';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';

function Category({ value }: CategoryProp) {
    const { i18n } = useCoreContext();
    const tooltipRef = useUniqueIdentifier();

    return (
        <>
            <Tooltip content={i18n.get(`tooltip.${value}`)}>
                <span ref={tooltipRef}>{value}</span>
            </Tooltip>
        </>
    );
}

export default Category;

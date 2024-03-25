import { CategoryProps } from '@src/components/external/Transactions/components/Category/types';
import { Tooltip } from '@src/components/internal/Tooltip/Tooltip';
import useCoreContext from '@src/core/Context/useCoreContext';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';

function Category({ value }: CategoryProps) {
    const { i18n } = useCoreContext();
    const tooltipRef = useUniqueIdentifier();

    const tooltipKey = `tooltip.${value}`;

    return (
        <>
            {i18n.has(tooltipKey) && (
                <Tooltip content={i18n.get(tooltipKey)}>
                    <span ref={tooltipRef}>{value}</span>
                </Tooltip>
            )}
        </>
    );
}

export default Category;

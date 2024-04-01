import { CategoryProps } from '@src/components/external/Transactions/components/Category/types';
import { Tooltip } from '@src/components/internal/Tooltip/Tooltip';
import useCoreContext from '@src/core/Context/useCoreContext';

function Category({ value, isContainerHovered }: CategoryProps) {
    const { i18n } = useCoreContext();

    const tooltipKey = `tooltip.${value}`;

    return (
        <>
            {i18n.has(tooltipKey) && (
                <Tooltip content={i18n.get(tooltipKey)} isContainerHovered={isContainerHovered}>
                    <span>{value}</span>
                </Tooltip>
            )}
        </>
    );
}

export default Category;

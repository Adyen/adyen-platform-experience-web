import useCoreContext from '../../../../../core/Context/useCoreContext';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { CategoryProps } from './types';

function Category({ value, isContainerHovered }: CategoryProps) {
    const { i18n } = useCoreContext();

    const tooltipKey = `tooltip.${value}`;

    return (
        <>
            {i18n.has(tooltipKey) && (
                <Tooltip content={i18n.get(tooltipKey)} isContainerHovered={isContainerHovered}>
                    <span>
                        <Typography variant={TypographyVariant.BODY}>{value}</Typography>
                    </span>
                </Tooltip>
            )}
        </>
    );
}

export default Category;

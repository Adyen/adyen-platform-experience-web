import { CategoryProps } from './types';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useTranslation } from 'react-i18next';

function Category({ value, isContainerHovered }: CategoryProps) {
    const { i18n } = useCoreContext();
    const { t } = useTranslation();
    const tooltipKey = `tooltip.${value}`;

    return (
        <>
            {i18n.has(tooltipKey) && (
                <Tooltip content={t(tooltipKey)} isContainerHovered={isContainerHovered}>
                    <span>{value}</span>
                </Tooltip>
            )}
        </>
    );
}

export default Category;

import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../../translations';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { CategoryProps } from './types';

function Category({ value, isContainerHovered }: CategoryProps) {
    const { i18n } = useCoreContext();

    const tooltipKey = `transactions.common.types.${value}.description` satisfies TranslationKey;

    return (
        <>
            {i18n.has(tooltipKey) && (
                <Tooltip content={i18n.get(tooltipKey)} isContainerHovered={isContainerHovered}>
                    <span>
                        <Typography variant={TypographyVariant.BODY}>
                            {i18n.has(`transactions.common.types.${value}`) ? i18n.get(`transactions.common.types.${value}`) : `${value}`}
                        </Typography>
                    </span>
                </Tooltip>
            )}
        </>
    );
}

export default Category;

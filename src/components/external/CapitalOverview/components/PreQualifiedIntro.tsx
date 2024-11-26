import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../constants';
import InfoBox from '../../../internal/InfoBox';
import Button from '../../../internal/Button/Button';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { IDynamicOfferConfig } from '../../../../types';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import Typography from '../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../internal/Typography/types';

const PreQualifiedIntro = ({
    dynamicOffer,
    onSeeOptions,
    hideTitle,
}: {
    dynamicOffer: Required<IDynamicOfferConfig>;
    onSeeOptions: () => void;
    hideTitle?: boolean;
}) => {
    const { i18n } = useCoreContext();

    return (
        <>
            <CapitalHeader hideTitle={hideTitle} titleKey={'capital.needSomeExtraMoney'} />
            <div className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrant}>
                <InfoBox>
                    <Typography variant={TypographyVariant.BODY}>
                        {i18n.get('capital.youHaveBeenPrequalifiedForBusinessFinancingUpToX.part1')}
                        <strong>
                            {i18n.get('capital.youHaveBeenPrequalifiedForBusinessFinancingUpToX.part2', {
                                values: {
                                    amount: i18n.amount(dynamicOffer.maxAmount.value, dynamicOffer.maxAmount.currency, { minimumFractionDigits: 0 }),
                                },
                            })}
                        </strong>
                    </Typography>
                </InfoBox>
                <Button className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrantButton} onClick={onSeeOptions}>
                    {i18n.get('capital.seeOptions')}
                </Button>
            </div>
        </>
    );
};

export default PreQualifiedIntro;

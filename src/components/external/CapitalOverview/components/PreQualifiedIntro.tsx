import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../constants';
import InfoBox from '../../../internal/InfoBox';
import Button from '../../../internal/Button/Button';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { IDynamicOffersConfig } from '../../../../types';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import Typography from '../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../internal/Typography/types';

const PreQualifiedIntro = ({
    dynamicOfferConfig,
    hideTitle,
    onOfferOptionsRequest,
}: {
    dynamicOfferConfig: Required<IDynamicOffersConfig>;
    hideTitle?: boolean;
    onOfferOptionsRequest: () => void;
}) => {
    const { i18n } = useCoreContext();

    return (
        <>
            <CapitalHeader hideTitle={hideTitle} titleKey={'capital.overview.common.titles.qualificationIntro'} />
            <div className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrant}>
                <InfoBox>
                    <Typography variant={TypographyVariant.BODY}>
                        {i18n.get('capital.overview.prequalified.alreadyQualifyInfo.part1')}
                        <strong>
                            {i18n.get('capital.overview.prequalified.alreadyQualifyInfo.part2', {
                                values: {
                                    amount: i18n.amount(dynamicOfferConfig.maxAmount.value, dynamicOfferConfig.maxAmount.currency, {
                                        minimumFractionDigits: 0,
                                    }),
                                },
                            })}
                        </strong>
                    </Typography>
                </InfoBox>
                <Button className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrantButton} onClick={onOfferOptionsRequest}>
                    {i18n.get('capital.overview.prequalified.actions.seeOptions')}
                </Button>
            </div>
        </>
    );
};

export default PreQualifiedIntro;

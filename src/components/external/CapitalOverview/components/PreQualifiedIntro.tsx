import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../constants';
import InfoBox from '../../../internal/InfoBox';
import Button from '../../../internal/Button/Button';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { IDynamicOfferConfig } from '../../../../types';
import { CapitalHeader } from '../../../internal/CapitalHeader';

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
            <CapitalHeader hideTitle={hideTitle} hasSubtitle={false} titleKey={'needSomeExtraMoney'} />
            <div className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrant}>
                <InfoBox>
                    <div>
                        {i18n.get('capital.preQualifiedToReceiveFunds')}
                        <strong>
                            {i18n.get('capital.upTo', {
                                values: { amount: i18n.amount(dynamicOffer.maxAmount.value, dynamicOffer.maxAmount.currency) },
                            })}
                        </strong>
                    </div>
                </InfoBox>
                <Button className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrantButton} onClick={onSeeOptions}>
                    {i18n.get('capital.seeOptions')}
                </Button>
            </div>
        </>
    );
};

export default PreQualifiedIntro;

import { CAPITAL_OVERVIEW_CLASS_NAMES } from '../constants';
import InfoBox from '../../../internal/InfoBox';
import Button from '../../../internal/Button/Button';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { IDynamicOfferConfig } from '../../../../types';
import { useCallback, useMemo } from 'preact/hooks';
import { CapitalOverviewProps } from '../types';
import { CapitalHeader } from '../../../internal/CapitalHeader';

const PreQualified = ({
    dynamicOffer,
    onOfferReview,
    hideTitle,
}: {
    dynamicOffer: Required<IDynamicOfferConfig>;
    onOfferReview: CapitalOverviewProps['onOfferReview'];
    hideTitle?: boolean;
}) => {
    const { i18n } = useCoreContext();

    // TODO: Implement this function
    const goToNextStep = useCallback(() => console.log('goToNextStep'), []);

    const onReviewOptions = useMemo(() => (onOfferReview ? onOfferReview : goToNextStep), [goToNextStep, onOfferReview]);

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
                <Button className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrantButton} onClick={onReviewOptions}>
                    {i18n.get('capital.reviewOptions')}
                </Button>
            </div>
        </>
    );
};

export default PreQualified;

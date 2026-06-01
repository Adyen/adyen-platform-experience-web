import { useCallback } from 'preact/hooks';
import { CAPITAL_OVERVIEW_CLASS_NAMES, sharedCapitalOverviewAnalyticsEventProperties } from '../constants';
import { useLandedPageEvent } from '../../../../hooks/useEventDispatcher/useLandedPageEvent';
import InfoBox from '@integration-components/ui-components-preact/InfoBox';
import Button from '@integration-components/ui-components-preact/Button/Button';
import useEventDispatcherContext from '../../../../core/Context/eventDispatcher/useEventDispatcherContext';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { IDynamicOffersConfig } from '../../../../types';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Prequalified',
} as const;

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
    const userEvents = useEventDispatcherContext();

    const onOfferOptionsRequestWithTracking = useCallback<typeof onOfferOptionsRequest>(() => {
        try {
            return onOfferOptionsRequest();
        } finally {
            userEvents.addEvent?.('Clicked button', { ...sharedAnalyticsEventProperties, label: 'See options' });
        }
    }, [onOfferOptionsRequest, userEvents]);

    useLandedPageEvent({ ...sharedAnalyticsEventProperties, label: 'Capital overview' });

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
                <Button className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrantButton} onClick={onOfferOptionsRequestWithTracking}>
                    {i18n.get('capital.overview.prequalified.actions.seeOptions')}
                </Button>
            </div>
        </>
    );
};

export default PreQualifiedIntro;

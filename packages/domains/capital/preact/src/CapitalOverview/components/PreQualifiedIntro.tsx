import { useCallback } from 'preact/hooks';
import { CAPITAL_OVERVIEW_CLASS_NAMES, sharedCapitalOverviewAnalyticsEventProperties } from '../constants';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/preact';
import { useLandedPageEvent } from '@integration-components/hooks-preact/useEventDispatcher/useLandedPageEvent';
import { IAmount } from '@integration-components/types';
import InfoBox from '@integration-components/ui-components-preact/InfoBox';
import Button from '@integration-components/ui-components-preact/Button/Button';
import { CapitalHeader } from '../../internal/CapitalHeader';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Prequalified',
} as const;

const PreQualifiedIntro = ({
    hideTitle,
    maxAmount,
    onOfferOptionsRequest,
}: {
    maxAmount: IAmount;
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
                                    amount: i18n.amount(maxAmount.value, maxAmount.currency, {
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

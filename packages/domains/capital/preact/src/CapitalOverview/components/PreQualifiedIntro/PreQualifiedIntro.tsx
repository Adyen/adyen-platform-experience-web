import { useCallback } from 'preact/hooks';
import { CAPITAL_OVERVIEW_CLASS_NAMES, sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/preact';
import { useLandedPageEvent } from '@integration-components/hooks-preact/useEventDispatcher/useLandedPageEvent';
import { IAmount } from '@integration-components/types';
import InfoBox from '@integration-components/ui-components-preact/InfoBox';
import Button from '@integration-components/ui-components-preact/Button/Button';
import { CapitalHeader } from '../../../internal/CapitalHeader';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import './PreQualifiedIntro.scss';

const sharedAnalyticsEventProperties = {
    ...sharedCapitalOverviewAnalyticsEventProperties,
    subCategory: 'Prequalified',
} as const;

const PreQualifiedIntro = ({
    hideTitle,
    maxAmount,
    onOfferOptionsRequest,
    region,
}: {
    maxAmount: IAmount;
    hideTitle?: boolean;
    onOfferOptionsRequest: () => void;
    region?: string;
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
            <CapitalHeader hideTitle={hideTitle} region={region} titleKey={'capital.overview.common.titles.qualificationIntro'} />
            <div className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrant}>
                <InfoBox className="adyen-pe-pre-qualified-intro__banner">
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
                    <Button className={CAPITAL_OVERVIEW_CLASS_NAMES.preQualifiedGrantButton} onClick={onOfferOptionsRequestWithTracking}>
                        {i18n.get('capital.overview.prequalified.actions.seeOptions')}
                    </Button>
                </InfoBox>
            </div>
        </>
    );
};

export default PreQualifiedIntro;

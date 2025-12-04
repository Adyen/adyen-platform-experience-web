import { useCallback, useEffect, useRef } from 'preact/hooks';
import { CAPITAL_OVERVIEW_CLASS_NAMES, sharedCapitalOverviewAnalyticsEventProperties } from '../constants';
import InfoBox from '../../../internal/InfoBox';
import Button from '../../../internal/Button/Button';
import useAnalyticsContext from '../../../../core/Context/analytics/useAnalyticsContext';
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
    const userEvents = useAnalyticsContext();

    const onOfferOptionsRequestWithTracking = useCallback<typeof onOfferOptionsRequest>(() => {
        try {
            return onOfferOptionsRequest();
        } finally {
            userEvents.addEvent?.('Clicked button', {
                ...sharedCapitalOverviewAnalyticsEventProperties,
                subCategory: 'Prequalified',
                label: 'See options',
            });
        }
    }, [onOfferOptionsRequest, userEvents]);

    const logPageEvent = useRef(true);

    useEffect(() => {
        if (logPageEvent.current) {
            // Log page event only when the component is mounted
            logPageEvent.current = false;

            userEvents.addEvent?.('Landed on page', {
                ...sharedCapitalOverviewAnalyticsEventProperties,
                subCategory: 'Prequalified view',
                label: 'Capital Overview',
            });
        }
    }, [userEvents]);

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

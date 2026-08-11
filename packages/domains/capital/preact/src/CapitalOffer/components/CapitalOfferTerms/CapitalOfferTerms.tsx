import { useCoreContext } from '@integration-components/core/preact';
import { TranslationKey } from '@integration-components/core';
import { IGrantOfferResponseDTO } from '@integration-components/types';
import { useCallback, useMemo } from 'preact/hooks';
import { useTimezoneAwareDateFormatting } from '@integration-components/hooks-preact';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '@integration-components/utils';
import {
    CAPITAL_REPAYMENT_FREQUENCY,
    EnhancedCapitalState,
    getIsEarlyRenewal,
    calculatePercentageFromBasisPoints,
    getSimplifiedRenewableGrant,
    calculateTimestampAfterDays,
    SimplifiedGrant,
} from '@integration-components/capital/domain';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import StructuredList from '@integration-components/ui-components-preact/StructuredList';
import { ListValue, StructuredListItem } from '@integration-components/ui-components-preact/StructuredList/types';
import Tabs from '@integration-components/ui-components-preact/Tabs/Tabs';
import { Tooltip } from '@integration-components/ui-components-preact/Tooltip/Tooltip';
import Icon from '@integration-components/ui-components-preact/Icon';
import cx from 'classnames';
import { useFormatTermLabel } from '../hooks/useFormatTermLabel';
import { TabProps } from '@integration-components/ui-components-preact/Tabs/types';
import './CapitalOfferTerms.scss';

type CapitalOfferTermsProps = {
    capitalState?: EnhancedCapitalState;
    grantOffer: IGrantOfferResponseDTO;
    hasBalanceAccountError: boolean;
};

export const CapitalOfferTerms = ({ capitalState, grantOffer, hasBalanceAccountError }: CapitalOfferTermsProps) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const formatTermLabel = useFormatTermLabel();

    const isEarlyRenewal = useMemo(() => capitalState && getIsEarlyRenewal(capitalState), [capitalState]);
    const simplifiedRenewableGrant = useMemo(() => capitalState && getSimplifiedRenewableGrant(capitalState), [capitalState]);

    const getStructuredListItems = useCallback(
        (grant: SimplifiedGrant) => {
            const days = grant.maximumRepaymentPeriodDays;
            const date = days && calculateTimestampAfterDays(days);
            const maximumRepaymentPeriodDate = date && dateFormat(date, DATE_FORMAT_CAPITAL_OVERVIEW);

            return [
                ...(capitalState?.renewableGrants?.length
                    ? [
                          {
                              key: 'capital.common.fields.financing',
                              value: i18n.amount(grant.grantAmount.value, grant.grantAmount.currency),
                          },
                          {
                              key: 'capital.common.fields.fees',
                              value: i18n.amount(grant.feesAmount.value, grant.feesAmount.currency),
                          },
                          {
                              key: 'capital.common.fields.totalRepaymentAmount',
                              value: i18n.amount(grant.totalAmount.value, grant.totalAmount.currency),
                          },
                      ]
                    : []),
                {
                    key: 'capital.common.fields.dailyRepaymentRate',
                    value: i18n.get('capital.common.values.percentage', {
                        values: { percentage: calculatePercentageFromBasisPoints(grant.repaymentRate) },
                    }),
                },
                ...(grant.aprBasisPoints
                    ? [
                          {
                              key: 'capital.common.fields.annualPercentageRate' as const,
                              value: i18n.get('capital.common.values.percentage', {
                                  values: { percentage: calculatePercentageFromBasisPoints(grant.aprBasisPoints) },
                              }),
                          },
                      ]
                    : []),
                {
                    key: 'capital.common.fields.repaymentThreshold',
                    value: i18n.amount(grant.thresholdAmount.value, grant.thresholdAmount.currency),
                },
                {
                    key: 'capital.common.fields.expectedRepaymentPeriod',
                    value: formatTermLabel(grant.expectedRepaymentPeriodDays),
                },
                ...(maximumRepaymentPeriodDate
                    ? [
                          {
                              key: 'capital.common.fields.maximumRepaymentDate' as const,
                              value: maximumRepaymentPeriodDate,
                          },
                      ]
                    : []),
                { key: 'capital.common.fields.account', value: i18n.get('capital.common.values.primaryAccount') },
            ] as StructuredListItem[];
        },
        [dateFormat, capitalState?.renewableGrants?.length, i18n, formatTermLabel]
    );

    const renderLabel = useCallback(
        (val: string, key: TranslationKey) => {
            if (key === 'capital.common.fields.repaymentThreshold') {
                return (
                    <Tooltip
                        isUnderlineVisible
                        content={i18n.get('capital.common.fields.repaymentThreshold.description', {
                            values: { days: CAPITAL_REPAYMENT_FREQUENCY },
                        })}
                    >
                        <span>
                            <Typography
                                className={'adyen-pe-capital-offer-summary-terms__list-label'}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.CAPTION}
                            >
                                {val}
                            </Typography>
                        </span>
                    </Tooltip>
                );
            }
            if (key === 'capital.common.fields.annualPercentageRate') {
                return (
                    <Tooltip isUnderlineVisible content={i18n.get('capital.common.fields.annualPercentageRate.description')}>
                        <span>
                            <Typography
                                className={'adyen-pe-capital-offer-summary-terms__list-label'}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.CAPTION}
                            >
                                {val}
                            </Typography>
                        </span>
                    </Tooltip>
                );
            }
            return (
                <Typography
                    className={'adyen-pe-capital-offer-summary-terms__list-label'}
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.CAPTION}
                >
                    {val}
                </Typography>
            );
        },
        [i18n]
    );

    const renderValue = useCallback(
        (val: ListValue, key: TranslationKey) => {
            const showWarningIcon = key === 'capital.common.fields.account' && hasBalanceAccountError;
            return (
                <Typography
                    className={cx({ ['adyen-pe-capital-offer-terms__details--error']: showWarningIcon })}
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.CAPTION}
                    stronger
                >
                    {showWarningIcon ? <Icon name={'warning-filled'} data-testid={'primary-account-warning-icon'} /> : null}
                    {val}
                </Typography>
            );
        },
        [hasBalanceAccountError]
    );

    const renderGrantDetails = useCallback(
        (grant: SimplifiedGrant) => (
            <StructuredList
                classNames="adyen-pe-capital-offer-terms__details"
                renderLabel={renderLabel}
                renderValue={renderValue}
                items={getStructuredListItems(grant)}
            />
        ),
        [getStructuredListItems, renderLabel, renderValue]
    );

    const renderNewGrantDetails = useCallback(() => renderGrantDetails(grantOffer), [grantOffer, renderGrantDetails]);

    const tabs = useMemo<TabProps<string>[]>(
        () => [
            {
                id: 'newLoan',
                label: 'capital.offer.summary.earlyRenewal.tabs.newGrant',
                content: renderNewGrantDetails(),
            },
            {
                id: 'currentLoan',
                label: 'capital.offer.summary.earlyRenewal.tabs.currentGrant',
                content: simplifiedRenewableGrant && renderGrantDetails(simplifiedRenewableGrant),
            },
        ],
        [simplifiedRenewableGrant, renderGrantDetails, renderNewGrantDetails]
    );

    return (
        <div className="adyen-pe-capital-offer-terms">
            {isEarlyRenewal ? (
                <Tabs tabs={tabs} />
            ) : (
                <>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} stronger>
                        {i18n.get('capital.common.termsTitle')}
                    </Typography>
                    {renderNewGrantDetails()}
                </>
            )}
        </div>
    );
};

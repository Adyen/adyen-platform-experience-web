import { FunctionalComponent } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import cx from 'classnames';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Card from '../../../../internal/Card/Card';
import { Tag } from '../../../../internal/Tag/Tag';
import ProgressBar from '../../../../internal/ProgressBar';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '../../../../../constants';
import { GRANT_ITEM_CLASS_NAMES } from './constants';
import { enhanceTermsAndConditionsUrl, getGrantConfig } from './utils';
import { GrantItemProps } from './types';
import './GrantItem.scss';
import { GrantDetails } from '../GrantDetails/GrantDetails';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { TranslationKey } from '../../../../../translations';
import { IGrant } from '../../../../../types';
import Alert from '../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import Button from '../../../../internal/Button';

const STATUS_TOOLTIP_MESSAGE = <Config extends { pendingToS: boolean }>(
    status: IGrant['status'],
    grantConfig: Config
): TranslationKey | undefined => {
    switch (status) {
        case 'Pending':
            return grantConfig.pendingToS ? 'capital.signTheTermsToReceiveYourFunds' : 'capital.youShouldGetTheFundsWithinOneBusinessDay';
        case 'Failed':
            return 'capital.weCouldNotProcessThisRequestTryAgain';
        case 'WrittenOff':
            return 'capital.youAcceptedTheseFundsButDidNotRepayThem';
        case 'Revoked':
            return 'capital.youAcceptedButThenReturnedTheseFunds';
        default:
            return undefined;
    }
};

export const GrantItem: FunctionalComponent<GrantItemProps> = ({ grant }) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const grantConfig = useMemo(() => getGrantConfig(grant), [grant]);
    const enhanceUrl = useCallback(enhanceTermsAndConditionsUrl, []);

    return (
        <div className={GRANT_ITEM_CLASS_NAMES.base}>
            <Card classNameModifiers={[GRANT_ITEM_CLASS_NAMES.overview]} filled={grantConfig.isBackgroundFilled} testId={'grant-container'}>
                <div className={GRANT_ITEM_CLASS_NAMES.statusContainer}>
                    {grant.status === 'Active' ? (
                        <>
                            <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN}>
                                {i18n.get('capital.termEnds')}
                            </Typography>
                            <Typography variant={TypographyVariant.CAPTION} stronger el={TypographyElement.SPAN}>
                                {dateFormat(grantConfig.repaymentPeriodEndDate, DATE_FORMAT_CAPITAL_OVERVIEW)}
                            </Typography>
                        </>
                    ) : grantConfig.statusKey ? (
                        STATUS_TOOLTIP_MESSAGE(grant.status, grantConfig) ? (
                            <Tooltip content={i18n.get(STATUS_TOOLTIP_MESSAGE(grant.status, grantConfig)!)}>
                                <div>
                                    <Tag label={i18n.get(grantConfig.statusKey)} variant={grantConfig.statusTagVariant} />
                                </div>
                            </Tooltip>
                        ) : (
                            <Tag label={i18n.get(grantConfig.statusKey)} variant={grantConfig.statusTagVariant} />
                        )
                    ) : null}
                </div>
                <Typography
                    variant={TypographyVariant.CAPTION}
                    className={cx({ [GRANT_ITEM_CLASS_NAMES.textSecondary]: grantConfig.isLabelColorSecondary })}
                    testId={'grant-amount-label'}
                >
                    {i18n.get(grantConfig.amountLabelKey)}
                </Typography>
                <Typography
                    variant={TypographyVariant.TITLE}
                    medium
                    className={cx({ [GRANT_ITEM_CLASS_NAMES.textSecondary]: grantConfig.isAmountColorSecondary })}
                >
                    {i18n.amount(grantConfig.amount.value, grantConfig.amount.currency)}
                </Typography>
                {grantConfig.isProgressBarVisible && (
                    <ProgressBar
                        className={GRANT_ITEM_CLASS_NAMES.progressBar}
                        value={grant.repaidGrantAmount.value}
                        max={grant.grantAmount.value}
                        labels={{ current: i18n.get('capital.repaid'), max: i18n.get('capital.remaining') }}
                    />
                )}
            </Card>
            {grantConfig.hasDetails && <GrantDetails grant={grant} />}
            {grant.missingActions.map(action => {
                const enhancedUrl = enhanceUrl(action.url);
                return (
                    <Alert
                        key={action.type}
                        className={GRANT_ITEM_CLASS_NAMES.actions}
                        type={AlertTypeOption.WARNING}
                        title={`${i18n.get('capital.signTermsAndConditionsToReceiveFunds')}${
                            grant.offerExpiresAt
                                ? ` ${i18n.get('capital.thisOfferExpiresOn', {
                                      values: {
                                          date: dateFormat(grant.offerExpiresAt, DATE_FORMAT_CAPITAL_OVERVIEW),
                                      },
                                  })}`
                                : ''
                        }`}
                        {...(enhancedUrl
                            ? {
                                  description: (
                                      <Button className={GRANT_ITEM_CLASS_NAMES.actionButton} href={enhancedUrl}>
                                          {i18n.get('capital.goToTermsAndConditions')}
                                      </Button>
                                  ),
                              }
                            : {})}
                    />
                );
            })}
        </div>
    );
};

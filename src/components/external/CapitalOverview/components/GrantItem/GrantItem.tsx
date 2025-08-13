import { FunctionalComponent } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import cx from 'classnames';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { Tag } from '../../../../internal/Tag/Tag';
import ProgressBar from '../../../../internal/ProgressBar';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '../../../../../constants';
import { GRANT_ITEM_CLASS_NAMES } from './constants';
import { getGrantConfig } from './utils';
import { GrantItemProps } from './types';
import './GrantItem.scss';
import { GrantDetails } from '../GrantDetails/GrantDetails';
import CopyText from '../../../../internal/CopyText/CopyText';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import Alert from '../../../../internal/Alert/Alert';
import Button from '../../../../internal/Button';
import { AlertTypeOption } from '../../../../internal/Alert/types';
import { ButtonVariant } from '../../../../internal/Button/types';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import { GrantActions } from '../GrantActions/GrantActions';

export const GrantItem: FunctionalComponent<GrantItemProps> = ({ grant, showDetails }) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const grantConfig = useMemo(() => getGrantConfig(grant), [grant]);
    const showUnscheduledRepaymentAccounts = useCallback(() => showDetails?.('unscheduledRepayment'), [showDetails]);

    const grantOverview = useMemo(
        () => (
            <div className={GRANT_ITEM_CLASS_NAMES.cardContent}>
                <div className={GRANT_ITEM_CLASS_NAMES.statusContainer}>
                    <Typography
                        variant={TypographyVariant.CAPTION}
                        className={cx({ [GRANT_ITEM_CLASS_NAMES.textSecondary]: grantConfig.isLabelColorSecondary })}
                        testId={'grant-amount-label'}
                    >
                        {i18n.get(grantConfig.amountLabelKey)}
                    </Typography>
                    <div>
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
                            grantConfig.statusTooltipKey ? (
                                <Tooltip content={i18n.get(grantConfig.statusTooltipKey)}>
                                    <div>
                                        <Tag label={i18n.get(grantConfig.statusKey)} variant={grantConfig.statusTagVariant} />
                                    </div>
                                </Tooltip>
                            ) : (
                                <Tag label={i18n.get(grantConfig.statusKey)} variant={grantConfig.statusTagVariant} />
                            )
                        ) : null}
                    </div>
                </div>
                <Typography
                    variant={TypographyVariant.TITLE}
                    medium
                    className={cx({
                        [GRANT_ITEM_CLASS_NAMES.textSecondary]: grantConfig.isAmountColorSecondary,
                    })}
                >
                    {i18n.amount(grantConfig.amount.value, grantConfig.amount.currency)}
                </Typography>
                {grantConfig.isProgressBarVisible && (
                    <ProgressBar
                        className={GRANT_ITEM_CLASS_NAMES.progressBar}
                        value={grant.repaidTotalAmount.value}
                        max={grant.totalAmount.value}
                        labels={{ current: i18n.get('capital.repaid'), max: i18n.get('capital.remaining') }}
                        tooltips={{
                            remaining: `${i18n.amount(grant.remainingTotalAmount.value, grant.remainingTotalAmount.currency)} ${i18n
                                .get('capital.remaining')
                                ?.toLowerCase()}`,
                            progress: `${i18n.amount(grant.repaidTotalAmount.value, grant.repaidTotalAmount.currency)} ${i18n
                                .get('capital.repaid')
                                ?.toLowerCase()}`,
                        }}
                    />
                )}
                {grantConfig.isGrantIdVisible ? (
                    <div className={GRANT_ITEM_CLASS_NAMES.grantID}>
                        <CopyText
                            textToCopy={grant.id}
                            visibleText={i18n.get('capital.grantID')}
                            buttonLabelKey="capital.grantItem.copyGrantID"
                            isHovered
                            type={'Text' as const}
                            data-testid="grant-id-copy-text"
                        />
                    </div>
                ) : null}
                {grantConfig.hasAlerts ? (
                    <>
                        {grant.missingActions && grant.missingActions.length ? (
                            <GrantActions
                                missingActions={grant.missingActions}
                                className={GRANT_ITEM_CLASS_NAMES.alert}
                                offerExpiresAt={grant.offerExpiresAt}
                            />
                        ) : (
                            <Alert
                                className={GRANT_ITEM_CLASS_NAMES.alert}
                                type={AlertTypeOption.HIGHLIGHT}
                                title={i18n.get('capital.weReceivedYourRequestAndWeAreWorkingOnItNowCheckBackSoon')}
                            />
                        )}
                    </>
                ) : (
                    grantConfig.hasUnscheduledRepaymentDetails && (
                        <div className={GRANT_ITEM_CLASS_NAMES.actionsBar}>
                            <Button
                                onClick={showUnscheduledRepaymentAccounts}
                                className={GRANT_ITEM_CLASS_NAMES.mainActionBtn}
                                variant={ButtonVariant.SECONDARY}
                                fullWidth
                            >
                                {i18n.get('capital.sendRepayment')}
                            </Button>
                        </div>
                    )
                )}
            </div>
        ),
        [i18n, dateFormat, grant, grantConfig, showUnscheduledRepaymentAccounts]
    );

    return (
        <div className={GRANT_ITEM_CLASS_NAMES.base}>
            <ExpandableCard renderHeader={grantOverview} filled={grantConfig.isBackgroundFilled} inFlow>
                {grantConfig.hasDetails && <GrantDetails grant={grant} />}
            </ExpandableCard>
        </div>
    );
};

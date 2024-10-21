import { FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
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
import { getGrantConfig } from './utils';
import { GrantItemProps } from './types';
import './GrantItem.scss';
import { ExpandableContainer } from '../../../../internal/ExpandableContainer/ExpandableContainer';

export const GrantItem: FunctionalComponent<GrantItemProps> = ({ grant }) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const grantConfig = useMemo(() => getGrantConfig(grant), [grant]);

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
                        <Tag label={i18n.get(grantConfig.statusKey)} variant={grantConfig.statusTagVariant} />
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
            <ExpandableContainer className={GRANT_ITEM_CLASS_NAMES.details}>{'Grant details'}</ExpandableContainer>
        </div>
    );
};

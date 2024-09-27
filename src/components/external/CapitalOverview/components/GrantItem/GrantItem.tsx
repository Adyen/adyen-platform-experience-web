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

export const GrantItem: FunctionalComponent<GrantItemProps> = ({ grant }) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const config = useMemo(() => getGrantConfig(grant), [grant]);

    return (
        <Card classNameModifiers={[GRANT_ITEM_CLASS_NAMES.base]} filled={config.isBackgroundFilled}>
            <div className={GRANT_ITEM_CLASS_NAMES.statusContainer}>
                {grant.status === 'Active' ? (
                    <>
                        <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN}>
                            {i18n.get('capital.termEnds')}
                        </Typography>
                        <Typography variant={TypographyVariant.CAPTION} stronger el={TypographyElement.SPAN}>
                            {dateFormat(config.repaymentPeriodEndDate, DATE_FORMAT_CAPITAL_OVERVIEW)}
                        </Typography>
                    </>
                ) : config.statusKey ? (
                    <Tag label={i18n.get(config.statusKey)} variant={config.statusTagVariant} />
                ) : null}
            </div>
            <Typography variant={TypographyVariant.CAPTION} className={cx({ [GRANT_ITEM_CLASS_NAMES.textSecondary]: config.isLabelColorSecondary })}>
                {i18n.get(config.labelKey)}
            </Typography>
            <Typography
                variant={TypographyVariant.TITLE}
                medium
                className={cx({ [GRANT_ITEM_CLASS_NAMES.textSecondary]: config.isAmountColorSecondary })}
            >
                {i18n.amount(config.amount.value, config.amount.currency)}
            </Typography>
            {config.isProgressBarVisible && (
                <ProgressBar
                    className={GRANT_ITEM_CLASS_NAMES.progressBar}
                    value={grant.repayedGrantAmount.value}
                    max={grant.grantAmount.value}
                    labels={{ current: i18n.get('capital.repaid'), max: i18n.get('capital.remaining') }}
                />
            )}
        </Card>
    );
};

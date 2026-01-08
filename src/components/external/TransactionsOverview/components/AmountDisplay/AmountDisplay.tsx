import cx from 'classnames';
import Icon from '../../../../internal/Icon';
import Typography from '../../../../internal/Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { useMemo } from 'preact/hooks';
import { classes } from './constants';
import './AmountDisplay.scss';

export interface AmountDisplayProps {
    amount: number;
    currency: string;
    description?: string;
    label: string;
    large?: boolean;
}

const AmountDisplay = ({ amount, currency, description, label, large }: AmountDisplayProps) => {
    const { i18n } = useCoreContext();

    const [amountTypographyProps, currencyTypographyProps] = useMemo(() => {
        const amountTypographyProps = large
            ? ({ variant: TypographyVariant.TITLE, large: true } as const)
            : ({ variant: TypographyVariant.SUBTITLE, stronger: true } as const);

        const currencyTypographyProps = large
            ? ({ variant: TypographyVariant.SUBTITLE, stronger: true } as const)
            : ({ variant: TypographyVariant.CAPTION, stronger: true } as const);

        return [amountTypographyProps, currencyTypographyProps] as const;
    }, [large]);

    const formattedAmount = useMemo(() => i18n.amount(amount, currency), [i18n, amount, currency]);

    return (
        <div className={classes.root}>
            <div className={classes.label}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                    {label}
                </Typography>

                {description && (
                    <Tooltip content={description}>
                        <span>
                            <Icon name="info" />
                        </span>
                    </Tooltip>
                )}
            </div>

            <div className={cx(classes.amount, { [classes.amountLarge]: large })}>
                <Typography el={TypographyElement.SPAN} {...amountTypographyProps}>
                    {formattedAmount}
                </Typography>

                <Typography el={TypographyElement.SPAN} className={classes.currency} {...currencyTypographyProps}>
                    {currency}
                </Typography>
            </div>
        </div>
    );
};

export default AmountDisplay;

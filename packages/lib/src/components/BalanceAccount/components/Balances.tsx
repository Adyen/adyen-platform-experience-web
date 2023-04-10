import { useMemo } from 'preact/hooks';
import useCoreContext from 'src/core/Context/useCoreContext';
import './Balances.scss';
import { BalanceAccountDetailsProps } from '../types';
import { CurrencyCode } from '../../../utils/constants/currency-codes';

interface BalancesProps {
    balances: BalanceAccountDetailsProps['balanceAccount']['balances'];
    defaultCurrency: CurrencyCode;
}
function Balances(props: BalancesProps) {
    const { i18n } = useCoreContext();
    const balances = useMemo(() => {
        const balances = [...props.balances];
        const index = props.balances.findIndex(balance => balance.currency === props.defaultCurrency);
        const defaultCurrency = balances.splice(index, 1);
        if (defaultCurrency.length > 0 && defaultCurrency[0]) balances.unshift(defaultCurrency[0]);
        return balances;
    }, [props.balances, props.defaultCurrency]);

    return (
        <div className="adyen-fp-balances">
            <div className="adyen-fp-subtitle">Balances</div>
            <div className="adyen-fp-balances__container">
                <div className="adyen-fp-balances__scrollable-area">
                    {balances?.map(balance => (

                        <div className="adyen-fp-balances__group">
                            <div className="adyen-fp-balances__title">
                                {balance.currency}
                                {balance.currency === props.defaultCurrency && <div class="adyen-fp-tag">Default</div>}
                            </div>
                            <div className="adyen-fp-balances__item">
                                <div className="adyen-fp-balances__key">Current balance</div>
                                <div className="adyen-fp-balances__value">
                                    {i18n.amount(balance.balance, balance.currency, { currencyDisplay: 'code', showSign: true })}
                                </div>
                            </div>

                            <div className="adyen-fp-balances__item">
                                <div className="adyen-fp-balances__key">Available balance</div>
                                <div className="adyen-fp-balances__value">
                                    {i18n.amount(balance.available, balance.currency, { currencyDisplay: 'code', showSign: true })}
                                </div>
                            </div>

                            <div className="adyen-fp-balances__item">
                                <div className="adyen-fp-balances__key">Reserved balance</div>
                                <div className="adyen-fp-balances__value">
                                    {i18n.amount(balance.reserved, balance.currency, { currencyDisplay: 'code', showSign: true })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Balances;

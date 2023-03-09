import { useMemo } from 'preact/hooks';
import useCoreContext from 'src/core/Context/useCoreContext';
import './Balances.scss';

function Balances(props) {
    const { i18n } = useCoreContext();
    const balances = useMemo(() => {
        const balances = [...props.balances];
        const index = props.balances.findIndex(balance => balance.currency === props.defaultCurrency);
        balances.unshift(balances.splice(index, 1)[0]);
        return balances;
    }, [props.balances, props.defaultCurrency]);

    return (
        <div class="adyen-fp-balances">
            <div class="adyen-fp-subtitle">Balances</div>
            <div class="adyen-fp-balances__container">
                <div className="adyen-fp-balances__scrollable-area">
                {balances?.map(balance => (
                    <div class="adyen-fp-balances__group">
                        <div class="adyen-fp-balances__title">
                            {balance.currency}
                            {balance.currency === props.defaultCurrency && <div class="adyen-fp-tag">Default</div>}
                        </div>
                        <div class="adyen-fp-balances__item">
                            <div class="adyen-fp-balances__key">Current balance</div>
                            <div class="adyen-fp-balances__value">
                                {i18n.amount(balance.balance, balance.currency, { currencyDisplay: 'code', showSign: true })}
                            </div>
                        </div>

                        <div class="adyen-fp-balances__item">
                            <div class="adyen-fp-balances__key">Available balance</div>
                            <div class="adyen-fp-balances__value">
                                {i18n.amount(balance.available, balance.currency, { currencyDisplay: 'code', showSign: true })}
                            </div>
                        </div>

                        <div class="adyen-fp-balances__item">
                            <div class="adyen-fp-balances__key">Reserved balance</div>
                            <div class="adyen-fp-balances__value">
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

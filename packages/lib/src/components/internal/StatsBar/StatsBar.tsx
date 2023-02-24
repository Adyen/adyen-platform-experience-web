import { h } from 'preact';
import './StatsBar.scss';

export default function StatsBar(props) {
    return (
        <div className="adyen-fp-stats-bar">
            {props.items.map(item => (
                <div class="adyen-fp-stats-bar__item">
                    <div class="adyen-fp-stats-bar__label">{item.label}</div>
                    <div class="adyen-fp-stats-bar__value">{item.value}</div>
                </div>
            ))}
        </div>
    );
}

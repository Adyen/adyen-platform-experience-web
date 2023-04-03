import './StatsBar.scss';
import { StatsBarProps } from './types';

export default function StatsBar(props: StatsBarProps) {
    return (
        <div className="adyen-fp-stats-bar">
            {props.items.map(item => (
                <div className="adyen-fp-stats-bar__item">
                    <div className="adyen-fp-stats-bar__label">{item.label}</div>
                    <div className="adyen-fp-stats-bar__value">{item.value}</div>
                </div>
            ))}
        </div>
    );
}

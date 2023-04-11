import './StatsBar.scss';

export default function StatsBar(props) {
    return (
        <div className="adyen-fp-stats-bar">
            {props.items.map(item => (
                <div className="adyen-fp-stats-bar__item" key={item.label}>
                    <div className="adyen-fp-stats-bar__label">{item.label}</div>
                    <div className="adyen-fp-stats-bar__value">{item.value}</div>
                </div>
            ))}
        </div>
    );
}

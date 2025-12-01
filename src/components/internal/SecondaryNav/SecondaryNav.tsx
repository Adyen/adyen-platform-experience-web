import './SecondaryNav.scss';
import cx from 'classnames';

interface SecondaryNavProps {
    className?: string;
    items: { value: string; label: string }[];
    activeValue: string;
    onValueChange: (value: string) => void;
}

export const SecondaryNav = ({ className, items, activeValue, onValueChange }: SecondaryNavProps) => {
    return (
        <aside className={cx('adyen-pe-secondary-nav', className)}>
            <ul className="adyen-pe-secondary-nav__list">
                {items.map(item => (
                    <li className="adyen-pe-secondary-nav__list-item">
                        <button
                            aria-selected={item.value === activeValue}
                            className={cx('adyen-pe-secondary-nav__item', { 'adyen-pe-secondary-nav__item--active': item.value === activeValue })}
                            onClick={() => {
                                onValueChange(item.value);
                            }}
                        >
                            <p data-testid="typography" className="adyen-pe-secondary-nav__item-label">
                                {item.label}
                            </p>
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

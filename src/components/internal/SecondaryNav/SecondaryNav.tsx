import './SecondaryNav.scss';
import cx from 'classnames';
import { Divider } from '../Divider/Divider';
import { containerQueries, useResponsiveContainer } from '../../../hooks/useResponsiveContainer';
import { useState } from 'preact/hooks';

interface SecondaryNavProps {
    className?: string;
    items: { value: string; label: string }[];
    activeValue: string;
    onValueChange: (value: string) => void;
    renderContent: (activeMenu: string) => JSX.Element;
    renderHeader: () => JSX.Element;
}

export const SecondaryNav = ({ renderHeader, className, items, activeValue, onValueChange, renderContent }: SecondaryNavProps) => {
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const [contentOpen, setContentOpen] = useState(!isSmContainer);

    return (
        <div className={cx('adyen-pe-secondary-nav', className)}>
            <aside>
                {renderHeader()}
                <ul className="adyen-pe-secondary-nav__list">
                    {items.map(item => (
                        <li key={item.label} className="adyen-pe-secondary-nav__list-item">
                            <button
                                aria-selected={item.value === activeValue}
                                className={cx('adyen-pe-secondary-nav__item', { 'adyen-pe-secondary-nav__item--active': item.value === activeValue })}
                                onClick={() => {
                                    onValueChange(item.value);
                                    isSmContainer && setContentOpen(true);
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
            {!isSmContainer && <Divider variant="vertical" />}
            {contentOpen && renderContent(activeValue)}
        </div>
    );
};

import './SecondaryNav.scss';
import cx from 'classnames';
import { Divider } from '../Divider/Divider';
import { containerQueries, useResponsiveContainer } from '../../../hooks/useResponsiveContainer';
import { useCallback, useState } from 'preact/hooks';
import { VNode } from 'preact';

interface SecondaryNavProps<T> {
    className?: string;
    items: T[];
    activeValue: string;
    onValueChange: (value: T) => void;
    renderContent: (activeMenu: string) => VNode<any>;
    renderHeader: () => VNode<any>;
}

export interface SecondaryNavItem<T extends string = string> {
    value: T;
    label: string;
}

export const SecondaryNav = <T extends SecondaryNavItem>({
    renderHeader,
    className,
    items,
    activeValue,
    onValueChange,
    renderContent,
}: SecondaryNavProps<T>) => {
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const [contentOpen, setContentOpen] = useState(!isSmContainer);

    const onClick = useCallback(
        (item: T) => {
            onValueChange(item);
            isSmContainer && setContentOpen(true);
        },
        [isSmContainer, onValueChange]
    );

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
                                onClick={onClick.bind(null, item)}
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

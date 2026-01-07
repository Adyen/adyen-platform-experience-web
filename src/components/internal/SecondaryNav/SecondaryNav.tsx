import './SecondaryNav.scss';
import cx from 'classnames';
import { Divider } from '../Divider/Divider';
import { containerQueries, useResponsiveContainer } from '../../../hooks/useResponsiveContainer';
import { useCallback } from 'preact/hooks';
import { VNode } from 'preact';
import { ButtonVariant } from '../Button/types';
import Icon from '../Icon';
import Button from '../Button/Button';
import Typography from '../Typography/Typography';
import { TypographyVariant } from '../Typography/types';

interface SecondaryNavProps<T> {
    className?: string;
    items: T[];
    activeValue: string | null;
    onValueChange: (value: T) => void;
    renderContent: (activeMenu: string) => VNode<any>;
    renderLoadingContent: (activeMenu: string | null) => VNode<any>;
    renderHeader: () => VNode<any>;
    onContentVisibilityChange: (contentVisible: boolean) => void;
    loading?: boolean;
    contentVisible?: boolean;
}

export interface SecondaryNavItem<T extends string = string> {
    value: T;
    label: string;
}

const LoadingSkeleton = ({ rowNumber, className }: { rowNumber: number; className?: string }) => (
    <div className={cx('adyen-pe-secondary-nav__skeleton', className)}>
        {[...Array(rowNumber)].map((_, index) => (
            <div key={index} className="adyen-pe-secondary-nav__skeleton-item"></div>
        ))}
    </div>
);

export const SecondaryNav = <T extends SecondaryNavItem>({
    renderHeader,
    className,
    items,
    activeValue,
    onValueChange,
    loading,
    onContentVisibilityChange,
    renderContent,
    contentVisible,
    renderLoadingContent,
}: SecondaryNavProps<T>) => {
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

    const onClick = useCallback(
        (item: T) => {
            onValueChange(item);
            if (isSmContainer) {
                onContentVisibilityChange(true);
            }
        },
        [isSmContainer, onValueChange, onContentVisibilityChange]
    );

    const handleDismiss = useCallback(() => {
        onContentVisibilityChange(false);
    }, [onContentVisibilityChange]);

    if (loading) {
        return !isSmContainer ? (
            <div className={cx('adyen-pe-secondary-nav')}>
                <div className={'adyen-pe-secondary-nav__container'}>
                    <div className={'adyen-pe-secondary-nav__skeleton--aside'}>
                        <LoadingSkeleton rowNumber={1} />
                        <div className={'adyen-pe-secondary-nav__list'}>
                            <LoadingSkeleton rowNumber={2} />
                        </div>
                    </div>
                    <Divider variant="vertical" />
                    <div className={'adyen-pe-secondary-nav__loading-content'}>{renderLoadingContent(activeValue)}</div>
                </div>
            </div>
        ) : (
            <LoadingSkeleton rowNumber={3} className={'adyen-pe-secondary-nav__skeleton--content'} />
        );
    }

    return (
        <div className={cx('adyen-pe-secondary-nav', className, { 'adyen-pe-secondary-nav--mobile': isSmContainer })}>
            {isSmContainer && contentVisible && (
                <div className={cx({ 'adyen-pe-secondary-nav__close-content--mobile': isSmContainer })}>
                    <Button
                        onClick={handleDismiss}
                        variant={ButtonVariant.TERTIARY}
                        iconButton
                        classNameModifiers={['circle']}
                        className={`adyen-pe-modal__dismiss-button`}
                    >
                        <Icon name="cross" />
                    </Button>
                </div>
            )}
            <div className={cx('adyen-pe-secondary-nav__container', { 'adyen-pe-secondary-nav__container-mobile': isSmContainer })}>
                {(!contentVisible || !isSmContainer) && (
                    <aside className={cx('adyen-pe-secondary-nav--sidebar', { 'adyen-pe-secondary-nav--sidebar-mobile': isSmContainer })}>
                        {renderHeader()}
                        <ul className="adyen-pe-secondary-nav__list">
                            {items.map(item => (
                                <li key={item.label} className="adyen-pe-secondary-nav__list-item">
                                    <Button
                                        aria-selected={item.value === activeValue}
                                        className={cx('adyen-pe-secondary-nav__item', {
                                            'adyen-pe-secondary-nav__item--active': item.value === activeValue,
                                            'adyen-pe-secondary-nav__item--mobile': isSmContainer,
                                        })}
                                        iconRight={isSmContainer ? <Icon name="chevron-right" /> : undefined}
                                        onClick={onClick.bind(null, item)}
                                    >
                                        <Typography
                                            variant={TypographyVariant.BODY}
                                            stronger
                                            data-testid="typography"
                                            className="adyen-pe-secondary-nav__item-label"
                                        >
                                            {item.label}
                                        </Typography>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}
                {!isSmContainer && <Divider variant="vertical" />}
                {contentVisible && activeValue && renderContent(activeValue)}
            </div>
        </div>
    );
};

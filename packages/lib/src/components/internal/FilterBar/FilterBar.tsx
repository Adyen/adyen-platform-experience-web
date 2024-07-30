import { mediaQueries, useResponsiveViewport } from '../../external/TransactionsOverview/hooks/useResponsiveViewport';
import { ButtonVariant } from '../Button/types';
import Close from '../SVGIcons/Close';
import Filter from '../SVGIcons/Filter';
import { TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import cx from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import Button from '../Button';
import './FilterBar.scss';
import { FilterBarProps } from './types';
import { useTranslation } from 'react-i18next';

export default function FilterBar(props: PropsWithChildren<FilterBarProps>) {
    const { t } = useTranslation();
    const isSmViewport = useResponsiveViewport(mediaQueries.down.xs);
    const [showFilters, setShowFilters] = useState(!isSmViewport);

    useEffect(() => {
        setShowFilters(!isSmViewport);
    }, [isSmViewport]);

    return (
        <>
            {isSmViewport && (
                <div className="adyen-pe-filter-bar__header">
                    <Typography variant={TypographyVariant.SUBTITLE}>{t('transactions')}</Typography>
                    <Button
                        className={'adyen-pe-filter-bar__header-icon'}
                        variant={ButtonVariant.SECONDARY}
                        iconButton
                        onClick={() => setShowFilters(prevState => !prevState)}
                    >
                        {showFilters ? <Close /> : <Filter />}
                    </Button>
                </div>
            )}
            {showFilters && (
                <div aria-label={t('filterBar')} className={cx('adyen-pe-filter-bar', { 'adyen-pe-filter-bar__content--mobile': isSmViewport })}>
                    {props.children}
                    {props.canResetFilters && !!props.resetFilters && (
                        <Button variant={ButtonVariant.TERTIARY} onClick={props.resetFilters}>
                            {t('button.clearAll')}
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

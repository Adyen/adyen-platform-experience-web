import { mediaQueries, useMediaQuery } from '@src/components/external/TransactionsOverview/hooks/useMediaQuery';
import { ButtonVariant } from '@src/components/internal/Button/types';
import Close from '@src/components/internal/SVGIcons/Close';
import Filter from '@src/components/internal/SVGIcons/Filter';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import useCoreContext from '@src/core/Context/useCoreContext';
import cx from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';
import Button from '../Button';
import './FilterBar.scss';
import { FilterBarProps } from './types';

export default function FilterBar(props: PropsWithChildren<FilterBarProps>) {
    const { i18n } = useCoreContext();
    const isSmViewport = useMediaQuery(mediaQueries.down.xs);
    const [showFilters, setShowFilters] = useState(!isSmViewport);

    useEffect(() => {
        setShowFilters(!isSmViewport);
    }, [isSmViewport]);

    return (
        <>
            {isSmViewport && (
                <div className="adyen-pe-filter-bar__header">
                    <Typography variant={TypographyVariant.SUBTITLE}>{i18n.get('transactions')}</Typography>
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
                <div
                    aria-label={i18n.get('filterBar')}
                    className={cx('adyen-pe-filter-bar', { 'adyen-pe-filter-bar__content--mobile': isSmViewport })}
                >
                    {props.children}
                    {props.canResetFilters && !!props.resetFilters && (
                        <Button variant={ButtonVariant.TERTIARY} onClick={props.resetFilters}>
                            {i18n.get('button.clearAll')}
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

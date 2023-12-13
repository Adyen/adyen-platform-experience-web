import { ButtonVariant } from '@src/components/internal/Button/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import classnames from 'classnames';
import { useMemo } from 'preact/hooks';
import Button from '../Button';
import './Pagination.scss';
import { PaginationProps } from './types';
import LimitSelect from '@src/components/internal/Pagination/components/LimitSelect';

export default function Pagination({ next, hasNext, hasPrev, page, prev, limit, limitOptions, onLimitSelection }: PaginationProps) {
    const { i18n } = useCoreContext();

    const previousIcon = useMemo(() => <span>&lt;</span>, []);
    const nextIcon = useMemo(() => <span>&gt;</span>, []);

    const limitSelection = useMemo(
        () =>
            limitOptions &&
            onLimitSelection && (
                <div className="adyen-fp-pagination__limit-selector">
                    <LimitSelect onSelection={onLimitSelection} options={limitOptions} selectedOption={limit} />
                </div>
            ),
        [limitOptions, limit, onLimitSelection]
    );

    return (
        <div aria-label={i18n.get('paginatedNavigation')} className={`adyen-fp-pagination ${classnames({})}`}>
            <div className="adyen-fp-pagination__context">
                <span>
                    {i18n.get('pagination.page')} {page}
                </span>
                {limitSelection}
            </div>

            <div className="adyen-fp-pagination__controls">
                <Button
                    aria-label={i18n.get('pagination.previousPage')}
                    variant={ButtonVariant.TERTIARY}
                    disabled={!hasPrev}
                    iconLeft={previousIcon}
                    classNameModifiers={['circle']}
                    onClick={prev}
                />
                <Button
                    aria-label={i18n.get('pagination.nextPage')}
                    variant={ButtonVariant.TERTIARY}
                    disabled={!hasNext}
                    iconRight={nextIcon}
                    classNameModifiers={['circle']}
                    onClick={next}
                />
            </div>
        </div>
    );
}

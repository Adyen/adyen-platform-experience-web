import { ButtonVariant } from '@src/components/internal/Button/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import { EMPTY_ARRAY } from '@src/utils/common';
import classnames from 'classnames';
import { useMemo } from 'preact/hooks';
import Button from '../Button';
import './Pagination.scss';
import { PaginationProps } from './types';
import LimitSelect from './components/LimitSelect';

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
                    iconButton={true}
                    classNameModifiers={['circle'].concat(hasPrev ? EMPTY_ARRAY : 'disabled')}
                    onClick={prev}
                >
                    {previousIcon}
                </Button>
                <Button
                    aria-label={i18n.get('pagination.nextPage')}
                    variant={ButtonVariant.TERTIARY}
                    disabled={!hasNext}
                    iconButton={true}
                    classNameModifiers={['circle'].concat(hasNext ? EMPTY_ARRAY : 'disabled')}
                    onClick={next}
                >
                    {nextIcon}
                </Button>
            </div>
        </div>
    );
}

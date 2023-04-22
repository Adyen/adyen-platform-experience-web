import { useMemo } from 'preact/hooks';
import classnames from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import Button from '../Button';
import './Pagination.scss';
import { PaginationProps } from './types';

export default function Pagination({ next, page, pages, prev }: PaginationProps) {
    const { i18n } = useCoreContext();
    const hasPrevPage = useMemo(() => !!page && page > 1, [page]);
    const hasNextPage = useMemo(() => !!(page && pages) && page < pages, [page, pages]);

    return <div aria-label={i18n.get('paginatedNavigation')} className={`adyen-fp-pagination ${classnames({})}`}>
        <div className="adyen-fp-pagination__context">
            <span>{i18n.get('pagination.page')} {page}</span>
        </div>

        <div className="adyen-fp-pagination__controls">
            <Button
                aria-label={i18n.get('pagination.previousPage')}
                variant={'ghost'}
                disabled={!hasPrevPage}
                classNameModifiers={['circle', 'prev']}
                onClick={prev}
                label={'Previous'}
            />
            <Button
                aria-label={i18n.get('pagination.nextPage')}
                variant={'ghost'}
                disabled={!hasNextPage}
                classNameModifiers={['circle', 'next']}
                onClick={next}
                label={'Next'}
            />
        </div>
    </div>;
}

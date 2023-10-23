import useCoreContext from '@src/core/Context/useCoreContext';
import classnames from 'classnames';
import Button from '../Button';
import './Pagination.scss';
import { PaginationProps } from './types';

export default function Pagination({ next, hasNext, hasPrev, page, prev }: PaginationProps) {
    const { i18n } = useCoreContext();

    return (
        <div aria-label={i18n.get('paginatedNavigation')} className={`adyen-fp-pagination ${classnames({})}`}>
            <div className="adyen-fp-pagination__context">
                <span>
                    {i18n.get('pagination.page')} {page}
                </span>
            </div>

            <div className="adyen-fp-pagination__controls">
                <Button
                    aria-label={i18n.get('pagination.previousPage')}
                    variant={'ghost'}
                    disabled={!hasPrev}
                    classNameModifiers={['circle', 'prev']}
                    onClick={prev}
                >
                    Previous
                </Button>
                <Button
                    aria-label={i18n.get('pagination.nextPage')}
                    variant={'ghost'}
                    disabled={!hasNext}
                    classNameModifiers={['circle', 'next']}
                    onClick={next}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

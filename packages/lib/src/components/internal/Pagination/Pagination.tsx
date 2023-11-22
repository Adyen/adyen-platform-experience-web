import { ButtonVariant } from '@src/components/internal/Button/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import classnames from 'classnames';
import { useMemo } from 'preact/hooks';
import Button from '../Button';
import './Pagination.scss';
import { PaginationProps } from './types';

export default function Pagination({ next, hasNext, hasPrev, page, prev }: PaginationProps) {
    const { i18n } = useCoreContext();

    const previousIcon = useMemo(() => <span>&lt;</span>, []);
    const nextIcon = useMemo(() => <span>&gt;</span>, []);

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

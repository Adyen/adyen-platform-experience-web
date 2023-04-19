import classnames from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import Button from '../Button';
import './Pagination.scss';
import { PaginationProps } from './type';
import { PageNeighbours } from '../../../hooks/usePaginatedRecords';

export default function Pagination(props: PaginationProps) {
    const { i18n } = useCoreContext();

    const handleClick = (dir: PageNeighbours) => {
        props.onChange(dir);
    };

    return (
        <div aria-label={i18n.get('paginatedNavigation')} className={`adyen-fp-pagination ${classnames({})}`}>
            <div className="adyen-fp-pagination__context">
                <span>
                    {i18n.get('pagination.page')} {props.page}
                </span>
            </div>
            <div className="adyen-fp-pagination__controls">
                <Button
                    aria-label={i18n.get('pagination.previousPage')}
                    variant={'ghost'}
                    disabled={props.page === 1}
                    classNameModifiers={['circle', 'prev']}
                    onClick={() => handleClick(PageNeighbours.PREV)}
                    label={'Previous'}
                />
                <Button
                    aria-label={i18n.get('pagination.nextPage')}
                    variant={'ghost'}
                    disabled={!props.hasNextPage}
                    classNameModifiers={['circle', 'next']}
                    onClick={() => handleClick(PageNeighbours.NEXT)}
                    label={'Next'}
                />
            </div>
        </div>
    );
}

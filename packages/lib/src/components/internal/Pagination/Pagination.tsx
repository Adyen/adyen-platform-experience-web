import { ButtonVariant } from '@src/components/internal/Button/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import { EMPTY_ARRAY } from '@src/utils/common';
import classnames from 'classnames';
import { useCallback, useMemo } from 'preact/hooks';
import Button from '../Button';
import './Pagination.scss';
import { PaginationProps } from './types';
import Select from '@src/components/internal/FormFields/Select';
import { SelectItem } from '@src/components/internal/FormFields/Select/types';

export default function Pagination({ next, hasNext, hasPrev, page, prev, limit, limitOptions, onLimitSelection }: PaginationProps) {
    const { i18n } = useCoreContext();

    const previousIcon = useMemo(() => <span>&lt;</span>, []);
    const nextIcon = useMemo(() => <span>&gt;</span>, []);

    const _limitOptions = useMemo(
        () => limitOptions && Object.freeze(limitOptions.map(option => ({ id: `${option}`, name: `${option}` } as SelectItem))),
        [limitOptions]
    );

    const _onLimitChanged = useCallback(
        ({ target }: any) => {
            if (target?.value == undefined) return;
            onLimitSelection?.(+target.value);
        },
        [onLimitSelection]
    );

    return (
        <div aria-label={i18n.get('paginatedNavigation')} className={`adyen-fp-pagination ${classnames({})}`}>
            <div className="adyen-fp-pagination__context">
                <span>
                    {i18n.get('pagination.page')} {page}
                </span>
                {_limitOptions && onLimitSelection && (
                    <div className="adyen-fp-pagination__limit-selector">
                        <Select filterable={false} multiSelect={false} items={_limitOptions} onChange={_onLimitChanged} selected={`${limit ?? ''}`} />
                    </div>
                )}
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

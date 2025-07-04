import Icon from '../Icon';
import Button from '../Button';
import Select from '../FormFields/Select';
import classnames from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_ARRAY, isNullish } from '../../../utils';
import { SelectItem } from '../FormFields/Select/types';
import { ButtonVariant } from '../Button/types';
import { Translation } from '../Translation';
import { PaginationProps } from './types';
import './Pagination.scss';

export default function Pagination({ next, hasNext, hasPrev, prev, limit, limitOptions, onLimitSelection }: PaginationProps) {
    const { i18n } = useCoreContext();

    const _limitOptions = useMemo(
        () => limitOptions && Object.freeze(limitOptions.map(option => ({ id: `${option}`, name: `${option}` } as SelectItem))),
        [limitOptions]
    );

    const _onLimitChanged = useCallback(
        ({ target }: any) => {
            if (isNullish(target?.value)) return;
            onLimitSelection?.(+target.value);
        },
        [onLimitSelection]
    );

    return (
        <div aria-label={i18n.get('paginatedNavigation')} className={`adyen-pe-pagination ${classnames({})}`}>
            <div className="adyen-pe-pagination__context">
                {_limitOptions && onLimitSelection && (
                    <>
                        <div className="adyen-pe-pagination__limit" role="presentation">
                            <Translation
                                translationKey="pagination.showing"
                                fills={{
                                    limit: (
                                        <div className="adyen-pe-pagination__limit-selector">
                                            <Select
                                                setToTargetWidth={true}
                                                filterable={false}
                                                multiSelect={false}
                                                items={_limitOptions}
                                                onChange={_onLimitChanged}
                                                selected={`${limit ?? ''}`}
                                            />
                                        </div>
                                    ),
                                }}
                            />
                        </div>

                        <div className="adyen-pe-visually-hidden" aria-atomic="true" aria-live={limit ? 'polite' : 'off'}>
                            {limit && i18n.get('pagination.showing.notice', { values: { limit } })}
                        </div>
                    </>
                )}
            </div>

            <div className="adyen-pe-pagination__controls">
                <Button
                    variant={ButtonVariant.TERTIARY}
                    disabled={!hasPrev}
                    iconButton={true}
                    classNameModifiers={['circle'].concat(hasPrev ? EMPTY_ARRAY : 'disabled')}
                    onClick={prev}
                >
                    <Icon name="chevron-left" />
                    <span className="adyen-pe-visually-hidden">{i18n.get('pagination.previousPage')}</span>
                </Button>
                <Button
                    variant={ButtonVariant.TERTIARY}
                    disabled={!hasNext}
                    iconButton={true}
                    classNameModifiers={['circle'].concat(hasNext ? EMPTY_ARRAY : 'disabled')}
                    onClick={next}
                >
                    <span className="adyen-pe-visually-hidden">{i18n.get('pagination.nextPage')}</span>
                    <Icon name="chevron-right" />
                </Button>
            </div>
        </div>
    );
}

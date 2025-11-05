import Icon from '../Icon';
import Button from '../Button';
import Select from '../FormFields/Select';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import { EMPTY_ARRAY, isNullish } from '../../../utils';
import { SelectChangeEvent, SelectItem } from '../FormFields/Select/types';
import { ButtonVariant } from '../Button/types';
import { Translation } from '../Translation';
import { PaginationProps } from './types';
import './Pagination.scss';

const BASE_CLASS = 'adyen-pe-pagination';

const classes = {
    base: BASE_CLASS,
    context: BASE_CLASS + '__context',
    controls: BASE_CLASS + '__controls',
    limit: BASE_CLASS + '__limit',
    limitSelector: BASE_CLASS + '__limit-selector',
};

export default function Pagination({
    next,
    hasNext,
    hasPrev,
    prev,
    limit,
    limitOptions,
    onLimitSelection,
    ariaLabelKey,
    limitSelectAriaLabelKey,
}: PaginationProps) {
    const { i18n } = useCoreContext();

    const _limitOptions = useMemo(
        () =>
            limitOptions &&
            Object.freeze(
                limitOptions.map(
                    option =>
                        ({
                            name: option.toLocaleString(i18n.locale, { style: 'decimal' }),
                            id: String(option),
                        }) as SelectItem
                )
            ),
        [i18n, limitOptions]
    );

    const _onLimitChanged = useCallback(
        ({ target }: SelectChangeEvent) => {
            if (isNullish(target?.value)) return;
            onLimitSelection?.(+target.value);
        },
        [onLimitSelection]
    );

    return (
        <div role="group" aria-label={i18n.get(ariaLabelKey ?? 'common.pagination.label')} className={classes.base}>
            <div className={classes.context}>
                {_limitOptions && onLimitSelection && (
                    <div className={classes.limit} role="presentation">
                        <Translation
                            translationKey="common.pagination.controls.limitSelect"
                            fills={{
                                pageLimit: (
                                    <div className={classes.limitSelector}>
                                        <Select
                                            setToTargetWidth={true}
                                            filterable={false}
                                            multiSelect={false}
                                            items={_limitOptions}
                                            onChange={_onLimitChanged}
                                            selected={`${limit ?? ''}`}
                                            aria-label={i18n.get(limitSelectAriaLabelKey ?? 'common.pagination.controls.limitSelect.label')}
                                        />
                                    </div>
                                ),
                            }}
                        />
                    </div>
                )}
            </div>

            <div className={classes.controls}>
                <Button
                    variant={ButtonVariant.TERTIARY}
                    disabled={!hasPrev}
                    iconButton={true}
                    aria-label={i18n.get('common.pagination.controls.previousPage.label')}
                    classNameModifiers={['circle'].concat(hasPrev ? EMPTY_ARRAY : 'disabled')}
                    onClick={prev}
                >
                    <Icon name="chevron-left" />
                </Button>
                <Button
                    variant={ButtonVariant.TERTIARY}
                    disabled={!hasNext}
                    iconButton={true}
                    aria-label={i18n.get('common.pagination.controls.nextPage.label')}
                    classNameModifiers={['circle'].concat(hasNext ? EMPTY_ARRAY : 'disabled')}
                    onClick={next}
                >
                    <Icon name="chevron-right" />
                </Button>
            </div>
        </div>
    );
}

import cx from 'classnames';
import { memo } from 'preact/compat';
import Img from '@src/components/internal/Img';
import type { SelectItem, SelectItemProps } from '../types';
import CheckedBox from '@src/components/internal/SVGIcons/CheckedBox';
import UncheckedBox from '@src/components/internal/SVGIcons/UncheckedBox';
import Checkmark from '@src/components/internal/SVGIcons/Checkmark';
import {
    DROPDOWN_ELEMENT_ACTIVE_CLASS,
    DROPDOWN_ELEMENT_CHECKBOX_CLASS,
    DROPDOWN_ELEMENT_CHECKMARK_CLASS,
    DROPDOWN_ELEMENT_CLASS,
    DROPDOWN_ELEMENT_CONTENT_CLASS,
    DROPDOWN_ELEMENT_DISABLED_CLASS,
    DROPDOWN_ELEMENT_ICON_CLASS,
} from '../constants';

type _RenderSelectOptionResult<T extends SelectItem> = ReturnType<SelectItemProps<T>['renderListItem']>;
type _RenderSelectOptionData<T extends SelectItem> = Parameters<SelectItemProps<T>['renderListItem']>[0];

export const renderSelectListItemDefaultMultiSelected = <T extends SelectItem>(data: _RenderSelectOptionData<T>): _RenderSelectOptionResult<T> =>
    data.multiSelect ? (
        <span className={DROPDOWN_ELEMENT_CHECKBOX_CLASS}>
            {data.selected ? <CheckedBox role="presentation" /> : <UncheckedBox role="presentation" />}
        </span>
    ) : null;

export const renderSelectListItemDefaultSingleSelected = <T extends SelectItem>(data: _RenderSelectOptionData<T>): _RenderSelectOptionResult<T> =>
    data.multiSelect ? null : <span className={DROPDOWN_ELEMENT_CHECKMARK_CLASS}>{data.selected && <Checkmark role="presentation" />}</span>;

export const renderSelectListItemDefault = <T extends SelectItem>(data: _RenderSelectOptionData<T>): _RenderSelectOptionResult<T> => (
    <>
        {renderSelectListItemDefaultMultiSelected(data)}
        <div className={DROPDOWN_ELEMENT_CONTENT_CLASS}>
            {data.item.icon && <Img className={data.iconClassName as string} alt={data.item.name} src={data.item.icon} />}
            <span>{data.item.name}</span>
        </div>
        {renderSelectListItemDefaultSingleSelected(data)}
    </>
);

const SelectListItem = <T extends SelectItem>({ item, multiSelect, onKeyDown, onSelect, renderListItem, selected }: SelectItemProps<T>) => {
    const disabled = !!item.disabled;

    // A change in Preact v10.11.1 means that all falsy values are assessed and set on data attributes.
    // In the case of `data-disabled` we only ever want it set if item.disabled is actually true, since the presence
    // of the `data-disabled` attr, regardless of its value, will disable the select list item.
    const dataDisabled = item.disabled === true || null;

    const itemClassName = cx(DROPDOWN_ELEMENT_CLASS, {
        [DROPDOWN_ELEMENT_ACTIVE_CLASS]: selected,
        [DROPDOWN_ELEMENT_DISABLED_CLASS]: disabled,
    });

    return (
        <li
            aria-disabled={disabled}
            aria-selected={selected}
            className={itemClassName}
            data-disabled={dataDisabled}
            data-value={item.id}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            title={item.name}
            role="option"
            tabIndex={-1}
        >
            {renderListItem({ item, multiSelect, selected, iconClassName: DROPDOWN_ELEMENT_ICON_CLASS })}
        </li>
    );
};

export default memo(SelectListItem);

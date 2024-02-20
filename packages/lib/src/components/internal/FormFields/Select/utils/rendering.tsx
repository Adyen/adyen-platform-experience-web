import { VNode } from 'preact';
import { SVGProps } from 'preact/compat';
import Img from '@src/components/internal/Img';
import type { SelectItem, SelectProps } from '../types';
import { DROPDOWN_ELEMENT_CHECKMARK_CLASS } from '../constants';

type _RenderResult = VNode<any> | null;
export type RenderSelectOptionData<T extends SelectItem> = Parameters<NonNullable<SelectProps<T>['renderListItem']>>[0];
export type RenderSelectOption = <T extends SelectItem>(data: RenderSelectOptionData<T>) => _RenderResult;

const Checkmark = (props: Omit<SVGProps<SVGElement>, 'ref'>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16">
        <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M14.5 4.5a.7.7 0 0 0-1-1L6 10.9 2.5 7.5a.8.8 0 0 0-1 1l4 4a.8.8 0 0 0 1 0l8-8Z"
            clip-rule="evenodd"
        />
    </svg>
);

export const renderSelectOptionDefault: RenderSelectOption = ({ iconClassName, item }) => {
    return (
        <>
            {item.icon && <Img className={iconClassName as string} alt={item.name} src={item.icon} />}
            <span>{item.name}</span>
        </>
    );
};

export const renderSelectOptionWithCheckmarking: RenderSelectOption = ({ iconClassName, item, selected }) => (
    <>
        {item.icon && <Img className={iconClassName as string} alt={item.name} src={item.icon} />}
        <span>{item.id}</span>
        {selected && <Checkmark role="presentation" className={DROPDOWN_ELEMENT_CHECKMARK_CLASS} />}
    </>
);

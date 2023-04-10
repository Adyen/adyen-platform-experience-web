import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../BaseFilter';
import Field from '../../../FormFields/Field';
import InputText from '../../../FormFields/InputText';
import './DateFilter.scss';
import { DateFilterProps } from './types';
import { BaseFilterProps } from '../BaseFilter/types';

export default function DateFilter(props: DateFilterProps) {
    const { i18n } = useCoreContext();
    const value = props.from ? `${props.from} - ${props.to || i18n.get('notSet')}` : undefined;

    return (
        <BaseFilter
            {...props}
            value={value}
            type={'date'}
            body={baseProps => <DateFilterBody {...{ ...baseProps, from: props.from, to: props.to }} />}
        />
    );
}

export function DateFilterBody(props: { to?: string; from?: string; updateFilterValue: (e: Event) => void } & BaseFilterProps) {
    const { i18n } = useCoreContext();

    const handleFilterValueUpdate = (field: string) => (e: Event) => {
        props.updateFilterValue?.(e);
    };

    return (
        <div>
            <Field label={i18n.get('from')} name={'from'}>
                <InputText name={'from'} value={props.from} onInput={handleFilterValueUpdate('from')} />
            </Field>
            <Field label={i18n.get('to')} name={'to'}>
                <InputText name={'to'} value={props.to} onInput={handleFilterValueUpdate('to')} placeholder={!props.to ? i18n.get('notSet') : null} />
            </Field>
            <br />
        </div>
    );
}

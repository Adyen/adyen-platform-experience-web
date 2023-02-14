import { h } from 'preact';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../BaseFilter';
import Field from '../../../FormFields/Field';
import InputText from '../../../FormFields/InputText';
import './DateFilter.scss';

export default function DateFilter(props) {
    const { i18n } = useCoreContext();
    const value = props.from ? `${props.from} - ${props.to || i18n.get('notSet')}` : null;

    return <BaseFilter {...props} value={value} type={'date'} body={props => <DateFilterBody {...{ ...props, from: props.from, to: props.to }} />} />;
}

export function DateFilterBody(props) {
    const { i18n } = useCoreContext();

    const handleFilterValueUpdate = field => e => {
        props.updateFilterValue(e);
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

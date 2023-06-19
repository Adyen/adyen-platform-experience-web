import cx from 'classnames';
import './RadioGroup.scss';
import { RadioGroupProps } from './types';
import { getUniqueId } from '../../../../utils/idGenerator';

export default function RadioGroup(props: RadioGroupProps) {
    const { items, name, onChange, value, isInvalid, uniqueId, className } = props;
    const uniqueIdBase = uniqueId?.replace(/[0-9]/g, '').substring(0, uniqueId.lastIndexOf('-'));
    return (
        <div className="adyen-fp-radio-group">
            {items.map(item => {
                const uniqueId = getUniqueId(uniqueIdBase);
                return (
                    <div key={item.id} className="adyen-fp-radio-group__input-wrapper">
                        <input
                            id={uniqueId}
                            type="radio"
                            checked={value === item.id}
                            className="adyen-fp-radio-group__input"
                            name={name}
                            onChange={onChange}
                            onClick={onChange}
                            value={item.id}
                        />
                        <label
                            className={cx([
                                'adyen-fp-label__text',
                                'adyen-fp-radio-group__label',
                                className,
                                { 'adyen-fp-radio-group__label--invalid': isInvalid },
                            ])}
                            htmlFor={uniqueId}
                        >
                            {item.name}
                        </label>
                    </div>
                );
            })}
        </div>
    );
}

RadioGroup.defaultProps = {
    onChange: () => {},
    items: [],
};

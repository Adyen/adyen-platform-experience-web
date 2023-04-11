import { ComponentChildren } from 'preact';
import cx from 'classnames';
import useCoreContext from '../../../../core/Context/useCoreContext';
import './Fieldset.scss';

interface FieldsetProps {
    children: ComponentChildren;
    classNameModifiers: string[];
    label: string;
    readonly?: boolean;
}

export default function Fieldset({ children, classNameModifiers = [], label, readonly = false }: FieldsetProps) {
    const { i18n } = useCoreContext();

    return (
        <div
            className={cx([
                'adyen-fp-fieldset',
                ...classNameModifiers.map(m => `adyen-fp-fieldset--${m}`),
                { 'adyen-fp-fieldset--readonly': readonly }
            ])}
        >
            {label && <div className="adyen-fp-fieldset__title">{i18n.get(label)}</div>}

            <div className="adyen-fp-fieldset__fields">{children}</div>
        </div>
    );
}

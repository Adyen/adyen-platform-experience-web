import { ComponentChildren } from 'preact';
import cx from 'classnames';
import useCoreContext from '../../../../core/Context/useCoreContext';
import './Fieldset.scss';
import { TranslationKey } from '@src/core/Localization/types';

interface FieldsetProps {
    children: ComponentChildren;
    classNameModifiers: string[];
    label: TranslationKey | '';
    readonly?: boolean;
}

export default function Fieldset({ children, classNameModifiers = [], label, readonly = false }: FieldsetProps) {
    const { i18n } = useCoreContext();

    return (
        <div
            className={cx([
                'adyen-pe-fieldset',
                ...classNameModifiers.map(m => `adyen-pe-fieldset--${m}`),
                { 'adyen-pe-fieldset--readonly': readonly },
            ])}
        >
            {label && <div className="adyen-pe-fieldset__title">{i18n.get(label)}</div>}

            <div className="adyen-pe-fieldset__fields">{children}</div>
        </div>
    );
}

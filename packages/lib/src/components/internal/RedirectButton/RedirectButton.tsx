import useCoreContext from '@src/core/Context/useCoreContext';
import { hasOwnProperty } from '@src/utils/common';
import { useState } from 'preact/hooks';
import { RedirectButtonProps } from './types';

function RedirectButton({ payButton, onSubmit, amount, name, ...props }: RedirectButtonProps) {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState('ready');

    props.setUIElementStatus?.((newStatus: string) => setStatus(newStatus));

    const payButtonLabel = () => {
        const isZeroAuth = amount && hasOwnProperty(amount, 'value') && amount.value === 0;
        if (isZeroAuth) return `${i18n.get('preauthorizeWith')} ${name}`;
        return `${i18n.get('continueTo')} ${name}`;
    };

    return (
        <>
            {payButton({
                ...props,
                status,
                classNameModifiers: ['standalone'],
                label: payButtonLabel(),
                onClick: onSubmit,
            })}
        </>
    );
}

export default RedirectButton;

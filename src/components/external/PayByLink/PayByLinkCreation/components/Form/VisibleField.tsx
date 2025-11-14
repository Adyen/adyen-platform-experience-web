import { FormValues } from '../types';
import { useWizardFormContext } from '../../../../../../hooks/form/wizard/WizardFormContext';
import { ComponentChildren } from 'preact';

export const VisibleField = ({ name, children }: { name: keyof FormValues; children: ComponentChildren }) => {
    const { fieldsConfig } = useWizardFormContext<FormValues>();
    return fieldsConfig[name]?.visible ? <>{children}</> : null;
};

import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Alert from '../../../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../../../internal/Alert/types';
import StoreField from './Fields/StoreField';

import { useEffect, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../../../core/ConfigContext';
import { useFetch } from '../../../../../../../hooks/useFetch';
import { PBLFormValues } from '../../types';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';

interface StoreFormProps {
    storeIds?: string[] | string;
    settingsQuery: ReturnType<typeof useFetch>;
    storesQuery: ReturnType<typeof useFetch>;
    selectItems: { id: string; name: string }[];
    termsAndConditionsProvisioned: boolean;
}

export const StoreForm = ({ settingsQuery, storesQuery, selectItems, termsAndConditionsProvisioned }: StoreFormProps) => {
    const { i18n } = useCoreContext();
    const { savePayByLinkSettings } = useConfigContext().endpoints;
    const { getValues } = useWizardFormContext<PBLFormValues>();
    const canModifySettings = !!savePayByLinkSettings;

    const selectedStoreId = getValues('store');

    const alertLabel = useMemo(() => {
        if (!termsAndConditionsProvisioned) {
            if (canModifySettings) {
                return 'payByLink.linkCreation.storeForm.alerts.tcSetupRequired';
            }
            return 'payByLink.linkCreation.storeForm.alerts.tcSetupRequiredWithoutPermissions';
        }
    }, [termsAndConditionsProvisioned, canModifySettings]);

    const alertActions = useMemo(() => {
        if (!canModifySettings) {
            return [];
        }
        return [
            {
                label: 'Set up Terms and Conditions',
                onClick: () => {
                    console.log('TODO: Open terms and conditions');
                },
            },
        ];
    }, [canModifySettings]);

    return (
        <div className="adyen-pe-pay-by-link-creation-form__fields-container">
            <StoreField items={selectItems} termsAndConditionsProvisioned={termsAndConditionsProvisioned} />
            {settingsQuery.data && storesQuery.data && selectedStoreId && !termsAndConditionsProvisioned && (
                <Alert
                    title={i18n.get('payByLink.linkCreation.storeForm.alerts.tcSetupRequiredTitle')}
                    type={AlertTypeOption.WARNING}
                    description={alertLabel && i18n.get(alertLabel)}
                    actions={alertActions}
                />
            )}
        </div>
    );
};

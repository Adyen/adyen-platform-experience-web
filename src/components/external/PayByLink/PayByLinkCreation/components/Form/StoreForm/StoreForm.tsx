import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Alert from '../../../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../../../internal/Alert/types';
import StoreField from './Fields/StoreField';

import { StateUpdater, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../../../core/ConfigContext';
import { PBLFormValues } from '../../types';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';
import { PayByLinkSettingsDTO, PayByLinkStoreDTO } from '../../../../../../../types';
import { Dispatch } from 'preact/compat';
import { StoreIds } from '../../../../types';
import './StoreForm.scss';

interface StoreFormProps {
    setShowTermsAndConditions: Dispatch<StateUpdater<boolean>>;
    storeIds?: StoreIds;
    settingsData?: PayByLinkSettingsDTO;
    storesData?: PayByLinkStoreDTO[];
    selectItems: { id: string; name: string }[];
    termsAndConditionsProvisioned: boolean;
}

export const StoreForm = ({ setShowTermsAndConditions, settingsData, storesData, selectItems, termsAndConditionsProvisioned }: StoreFormProps) => {
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
                label: i18n.get('payByLink.linkCreation.storeForm.alerts.tcSetupRequiredAction'),
                onClick: () => {
                    setShowTermsAndConditions(true);
                },
            },
        ];
    }, [canModifySettings, setShowTermsAndConditions, i18n]);

    return (
        <div className="adyen-pe-pay-by-link-creation-form__fields-container">
            <StoreField items={selectItems} />
            {settingsData && storesData && selectedStoreId && !termsAndConditionsProvisioned && (
                <Alert
                    className="adyen-pe-pay-by-link-creation-form__tc-alert"
                    title={i18n.get('payByLink.linkCreation.storeForm.alerts.tcSetupRequiredTitle')}
                    type={AlertTypeOption.WARNING}
                    description={alertLabel && i18n.get(alertLabel)}
                    actions={alertActions}
                />
            )}
        </div>
    );
};

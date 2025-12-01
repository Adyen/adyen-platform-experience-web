import { useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { ActiveMenuItem } from '../components/PayByLinkSettingsContainer/PayByLinkSettingsContainer';

export interface PayByLinkSettingsMenuProps {
    activeView: string;
    changeSaveParameter: any;
    onSave: (activeView: any) => void;
    isSaveButtonDisabled: boolean;
}

export const useSettingsMenu = (props: PayByLinkSettingsMenuProps) => {
    const [activeView, setActiveView] = useState<string>(props.activeView);
    const { updatePayByLinkSettings, updatePayByLinkTheme } = useConfigContext().endpoints;

    const onSave = props => menuItem => {
        if (activeView === ActiveMenuItem.theme) {
        }
        if (activeView === ActiveMenuItem.termsAndConditions) {
        }
    };
};

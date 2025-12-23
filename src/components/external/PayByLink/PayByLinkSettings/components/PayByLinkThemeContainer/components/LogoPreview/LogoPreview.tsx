import useUniqueId from '../../../../../../../../hooks/useUniqueId';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useCallback } from 'preact/hooks';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import Typography from '../../../../../../../internal/Typography/Typography';
import { LogoLabel } from '../ThemeForm/constants';
import { ButtonVariant } from '../../../../../../../internal/Button/types';
import Button from '../../../../../../../internal/Button';
import { LogoTypes } from '../../types';

const LogoPreview = ({ logoType, logoURL, onRemoveLogo }: { logoType: LogoTypes; logoURL: string; onRemoveLogo: (logoType: LogoTypes) => void }) => {
    const { i18n } = useCoreContext();
    const logoURLId = useUniqueId();

    const onRemoveURL = useCallback(() => {
        onRemoveLogo(logoType);
    }, [logoType, onRemoveLogo]);

    return (
        <div className="adyen-pe-pay-by-link-settings__input-container adyen-pe-pay-by-link-theme-form__preview--conteiner">
            <label htmlFor={logoURLId} aria-labelledby={logoURLId}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {i18n.get(LogoLabel[logoType])}
                </Typography>
            </label>
            <img id={logoURLId} src={logoURL} alt={'full-width-logo'} className={'adyen-pe-pay-by-link-theme-form__preview--image'} />
            <Button variant={ButtonVariant.PRIMARY} onClick={onRemoveURL} className="adyen-pe-pay-by-link-theme-form__preview--remove">
                {i18n.get('payByLink.settings.theme.action.logo.remove')}
            </Button>
        </div>
    );
};

export default LogoPreview;

import { useUniqueId } from '@integration-components/hooks-preact';
import { useCoreContext } from '@integration-components/core/preact';
import { useCallback } from 'preact/hooks';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { LogoLabel } from '../ThemeForm/constants';
import { ButtonVariant } from '@integration-components/ui-components-preact/Button/types';
import Button from '@integration-components/ui-components-preact/Button';
import { LogoTypes } from '../../types';

const LogoPreview = ({
    disabled,
    logoType,
    logoURL,
    onRemoveLogo,
}: {
    disabled: boolean;
    logoType: LogoTypes;
    logoURL: string;
    onRemoveLogo: (logoType: LogoTypes) => void;
}) => {
    const { i18n } = useCoreContext();
    const logoURLId = useUniqueId();

    const onRemoveURL = useCallback(() => {
        onRemoveLogo(logoType);
    }, [logoType, onRemoveLogo]);

    return (
        <div className="adyen-pe-payment-link-theme-form__preview--conteiner">
            <label htmlFor={logoURLId} aria-labelledby={logoURLId}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {i18n.get(LogoLabel[logoType])}
                </Typography>
            </label>
            <img id={logoURLId} src={logoURL} alt={'full-width-logo'} className={'adyen-pe-payment-link-theme-form__preview--image'} />
            <Button
                disabled={disabled}
                variant={ButtonVariant.SECONDARY}
                onClick={onRemoveURL}
                className="adyen-pe-payment-link-theme-form__preview--remove"
            >
                {i18n.get('payByLink.settings.theme.action.logo.remove')}
            </Button>
        </div>
    );
};

export default LogoPreview;

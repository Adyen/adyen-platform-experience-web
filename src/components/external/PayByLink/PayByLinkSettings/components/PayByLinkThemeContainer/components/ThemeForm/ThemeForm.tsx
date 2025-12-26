import InputText from '../../../../../../../internal/FormFields/InputText';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import useUniqueId from '../../../../../../../../hooks/useUniqueId';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { logoOptions, logoOptionsList } from './constants';
import './ThemeForm.scss';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { h } from 'preact';
import Icon from '../../../../../../../internal/Icon';
import usePayByLinkSettingsContext from '../../../PayByLinkSettingsContainer/context/context';
import { LogoTypes, ThemeFormDataRequest, ThemeFormProps } from '../../types';
import LogoPreview from '../LogoPreview/LogoPreview';
import LogoInput from '../LogoInput/LogoInput';
import { cloneFormData } from '../../../PayByLinkSettingsContainer/utils/getThemePayload';
import Alert from '../../../../../../../internal/Alert/Alert';
import { AlertTypeOption } from '../../../../../../../internal/Alert/types';
import { noop } from '../../../../../../../../utils';

export const ThemeForm = ({ theme, initialPayload }: ThemeFormProps) => {
    const { setPayload, saveActionCalled, setSaveActionCalled, setIsValid, isSaveSuccess, isSaveError, setIsSaveError, setIsSaveSuccess, isSaving } =
        usePayByLinkSettingsContext();

    const { brandName: initialBrandName, logo, fullWidthLogo } = theme;
    const [brandName, setBrandName] = useState(initialBrandName ?? undefined);
    const [logoUrl, setLogoUrl] = useState(logo ?? null);
    const [fullWidthLogoUrl, setFullWidthLogoUrl] = useState(fullWidthLogo ?? null);
    const [themePayload, setThemePayload] = useState<FormData | undefined>();
    const [showMissingBrandName, setShowMissingBrandName] = useState(false);

    const brandInputId = useUniqueId();
    const { i18n } = useCoreContext();

    useEffect(() => {
        setIsValid(!!brandName);
    }, [brandName, setIsValid, themePayload, setPayload]);

    useEffect(() => {
        setThemePayload(initialPayload);
    }, [initialPayload]);

    useEffect(() => {
        if (saveActionCalled) {
            if (!brandName) {
                setShowMissingBrandName(true);
            }
            setSaveActionCalled(false);
        }
    }, [saveActionCalled, setSaveActionCalled, brandName, setShowMissingBrandName]);

    const addFileToThemePayload = useCallback(
        (field: string, file: File) => {
            setThemePayload(previousFormData => {
                const nextFormData = previousFormData ? cloneFormData(previousFormData) : new FormData();
                nextFormData.set(field, file, file.name);
                nextFormData.set(field, file, file.name);
                setPayload(nextFormData);
                return nextFormData;
            });
        },
        [setPayload]
    );

    const onBrandNameChange = useCallback(
        (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
            const value = e?.currentTarget?.value;
            setShowMissingBrandName(false);
            setBrandName(value);
            setThemePayload(previousFormData => {
                const nextFormData = previousFormData ? cloneFormData(previousFormData) : new FormData();
                nextFormData.set(ThemeFormDataRequest.BRAND, value);
                setPayload(nextFormData);
                return nextFormData;
            });
        },
        [setShowMissingBrandName, setBrandName, setThemePayload, setPayload]
    );

    const removeFieldFromThemePayload = useCallback(
        (field: string) => {
            setThemePayload(previousFormData => {
                if (previousFormData && previousFormData.has(field)) {
                    const nextFormData = cloneFormData(previousFormData);
                    nextFormData.delete(field);
                    setPayload(nextFormData);
                    return nextFormData;
                }
                return previousFormData;
            });
        },
        [setPayload]
    );

    const logoPreview = useCallback(
        (type: LogoTypes, file: File) => {
            const reader = new FileReader();

            reader.onload = function (e) {
                const result = e?.target?.result as string;
                if (type === logoOptions.LOGO) {
                    setLogoUrl(result);
                }
                if (type === logoOptions.FULL_WIDTH_LOGO) {
                    setFullWidthLogoUrl(result);
                }
            };
            reader.readAsDataURL(file);
        },
        [setLogoUrl, setFullWidthLogoUrl]
    );

    const onLogoChange = useCallback(
        (type: LogoTypes, files: File[]) => {
            const file = files[0];
            if (!file) return;
            addFileToThemePayload(type, file);
            logoPreview(type, file);
        },
        [addFileToThemePayload, logoPreview]
    );

    const onRemoveLogoUrl = useCallback(
        (logoType: LogoTypes) => {
            removeFieldFromThemePayload(logoType);
            if (logoType === logoOptions.LOGO) {
                setLogoUrl(null);
            }
            if (logoType === logoOptions.FULL_WIDTH_LOGO) {
                setFullWidthLogoUrl(null);
            }
        },
        [removeFieldFromThemePayload, setLogoUrl, setFullWidthLogoUrl]
    );

    const getLogoUrl = useCallback(
        (logoType: LogoTypes) => {
            return logoType === logoOptions.LOGO ? logoUrl : fullWidthLogoUrl;
        },
        [fullWidthLogoUrl, logoUrl]
    );

    return (
        <div className="adyen-pe-pay-by-link-theme-form">
            <div className="adyen-pe-pay-by-link-settings__input-container">
                <label htmlFor={brandInputId} aria-labelledby={brandInputId} className="adyen-pe-pay-by-link-theme-form__brand-input">
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('payByLink.settings.theme.brandName.input.label')}
                    </Typography>
                </label>
                <InputText
                    type="text"
                    lang={i18n.locale}
                    uniqueId={brandInputId}
                    value={brandName}
                    onInput={onBrandNameChange}
                    placeholder={i18n.get('payByLink.settings.theme.brandName.input.placeholder')}
                />
                {showMissingBrandName && (
                    <div className="adyen-pe-pay-by-link-theme-form__error">
                        <Icon name="cross-circle-fill" className={'adyen-pe-pay-by-link-theme-form__error-icon'} />
                        <Typography
                            className={'adyen-pe-pay-by-link-theme-form__error-text'}
                            el={TypographyElement.SPAN}
                            variant={TypographyVariant.BODY}
                        >
                            {i18n.get('payByLink.settings.theme.inputs.brandName.errors.missing')}
                        </Typography>
                    </div>
                )}
            </div>
            {logoOptionsList.map(logoType => {
                const url = getLogoUrl(logoType);
                return (
                    <div key={logoType} className="adyen-pe-pay-by-link-settings__input-container">
                        {url ? (
                            <LogoPreview logoType={logoType} logoURL={url} onRemoveLogo={onRemoveLogoUrl} />
                        ) : (
                            <LogoInput logoType={logoType} onFileInputChange={onLogoChange} />
                        )}
                    </div>
                );
            })}
            {isSaveSuccess && (
                <Alert
                    type={AlertTypeOption.SUCCESS}
                    onClose={() => setIsSaveSuccess(false)}
                    description={i18n.get('payByLink.settings.common.alerts.saveSuccess')}
                />
            )}
            {isSaveError && (
                <Alert
                    type={AlertTypeOption.CRITICAL}
                    onClose={() => setIsSaveError(false)}
                    description={i18n.get('payByLink.settings.common.alerts.saveError')}
                />
            )}
        </div>
    );
};

import InputText from '../../../../../internal/FormFields/InputText';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import useUniqueId from '../../../../../../hooks/useUniqueId';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import FileInput from '../../../../../internal/FormFields/FileInput/FileInput';
import { THEME_FORM_ALLOWED_FILE_TYPES } from './constants';
import { THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE } from './constants';
import { getHumanReadableFileSize } from '../../../../../../utils';
import { getHumanReadableFileName } from '../../../../../../utils/file/naming';
import './ThemeForm.scss';
import Button from '../../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../../internal/Button/types';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import useMutation from '../../../../../../hooks/useMutation/useMutation';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { h } from 'preact';
import Icon from '../../../../../internal/Icon';
import { FC } from 'preact/compat';
import { TranslationKey } from '../../../../../../translations';

interface ThemeFormProps {
    theme?: {
        brandName?: string;
        logoUrl?: string;
        fullWidthLogoUrl?: string;
    };
    selectedStore: string;
}

const ThemeFormDataRequest = {
    BRAND: 'brand',
    LOGO: 'logo',
    FULL_WIDTH_LOGO: 'fullWidthLogo',
};

const LogoLabel = {
    logo: 'payByLink.settings.theme.logo.input.label',
    fullWidthLogo: 'payByLink.settings.theme.wideLogo.input.label',
} as Record<LogoTypes, TranslationKey>;

const cloneFormData = (formData: FormData) => {
    const formDataClone = new FormData();
    for (const [field, value] of formData.entries()) {
        if (value instanceof File) {
            formDataClone.set(field, value, value.name);
        } else formDataClone.set(field, value);
    }
    return formDataClone;
};

type LogoTypes = 'logo' | 'fullWidthLogo';

const logoOptions: Record<string, LogoTypes> = {
    LOGO: 'logo',
    FULL_WIDTH_LOGO: 'fullWidthLogo',
};

const logoOptionsList: LogoTypes[] = ['logo', 'fullWidthLogo'];

const getImageSizeLimitation = (logoType: LogoTypes) => {
    switch (logoType) {
        case logoOptions.LOGO:
            return '300 x 30 px';
        case logoOptions.FULL_WIDTH_LOGO:
        default:
            return '200 x 200 px';
    }
};

const LogoRequirements: FC<{ logoType: LogoTypes }> = ({ logoType }: { logoType: LogoTypes }) => {
    const { i18n } = useCoreContext();

    const logoFileInformationText = getImageSizeLimitation(logoType);

    return (
        <div className="adyen-pe-pay-by-link-theme-form__file-info-container">
            <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                {i18n.get('payByLink.settings.theme.limitations.file.input.supportedFile.text')}
                {THEME_FORM_ALLOWED_FILE_TYPES.map(type => getHumanReadableFileName(type)).join(', ')}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                {i18n.get('payByLink.settings.theme.limitations.file.input.maxSize.text')}
                {getHumanReadableFileSize(THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE)}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                {i18n.get('payByLink.settings.theme.limitations.file.input.imageSize.text')}
                {logoFileInformationText}
            </Typography>
        </div>
    );
};

const LogoInput: FC<{ logoType: LogoTypes; onFileInputChange: (logoType: LogoTypes, files: File[]) => void }> = ({
    logoType,
    onFileInputChange,
}: {
    logoType: LogoTypes;
    onFileInputChange: (logoType: LogoTypes, files: File[]) => void;
}) => {
    const { i18n } = useCoreContext();
    const logoInputId = useUniqueId();

    const onChange = useCallback(
        (files: File[]) => {
            onFileInputChange(logoType, files);
        },
        [logoType, onFileInputChange]
    );

    return (
        <div className="adyen-pe-pay-by-link-settings__input-container">
            <label htmlFor={logoInputId} aria-labelledby={logoInputId} className="adyen-pe-pay-by-link-theme-form__file-input">
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {i18n.get(LogoLabel[logoType])}
                </Typography>
            </label>
            <FileInput
                maxFileSize={THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE}
                allowedFileTypes={THEME_FORM_ALLOWED_FILE_TYPES}
                onChange={onChange}
                id={logoInputId}
            />
            <LogoRequirements logoType={logoType} />
        </div>
    );
};

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

export const ThemeForm = ({ theme, selectedStore }: ThemeFormProps) => {
    const initialBrandName = useRef<string | undefined>(theme?.brandName);
    const initialLogoUrl = useRef<string | undefined>(theme?.logoUrl);
    const initialFullWidthLogoUrl = useRef<string | undefined>(theme?.fullWidthLogoUrl);

    const [brandName, setBrandName] = useState(theme?.brandName ?? undefined);
    const [logoUrl, setLogoUrl] = useState(theme?.logoUrl ?? null);
    const [fullWidthLogoUrl, setFullWidthLogoUrl] = useState(theme?.fullWidthLogoUrl ?? null);
    const [themePayload, setThemePayload] = useState<FormData | null>(null);
    const [showMissingBrandName, setShowMissingBrandName] = useState(false);

    const brandInputId = useUniqueId();
    const { i18n } = useCoreContext();

    const { updatePayByLinkTheme } = useConfigContext().endpoints;

    const updatePayByLinkTermsAndConditions = useMutation({
        queryFn: updatePayByLinkTheme,
        options: {
            onSuccess: data => console.log(data),
        },
    });

    useEffect(() => {
        if (!initialBrandName.current) return;
        setThemePayload(previousFormData => {
            const nextFormData = previousFormData ? cloneFormData(previousFormData) : new FormData();
            nextFormData.set('brandName', initialBrandName.current!);
            return nextFormData;
        });
    }, [initialBrandName]);

    useEffect(() => {
        if (!initialLogoUrl.current) return;
        setThemePayload(previousFormData => {
            const nextFormData = previousFormData ? cloneFormData(previousFormData) : new FormData();
            nextFormData.set('logo', initialLogoUrl.current!);
            return nextFormData;
        });
    }, [initialLogoUrl]);

    useEffect(() => {
        if (!initialFullWidthLogoUrl.current) return;
        setThemePayload(previousFormData => {
            const nextFormData = previousFormData ? cloneFormData(previousFormData) : new FormData();
            nextFormData.set('fullWidthLogo', initialFullWidthLogoUrl.current!);
            return nextFormData;
        });
    }, [initialFullWidthLogoUrl]);

    const onSave = useCallback(() => {
        if (!brandName) {
            setShowMissingBrandName(true);
            return;
        }
        if (!themePayload) return;
        void updatePayByLinkTermsAndConditions.mutate(
            { contentType: 'multipart/form-data', body: themePayload },
            { path: { storeId: selectedStore! } }
        );
    }, [brandName, updatePayByLinkTermsAndConditions, selectedStore, themePayload]);

    const addFileToThemePayload = useCallback((field: string, file: File) => {
        setThemePayload(previousFormData => {
            const nextFormData = previousFormData ? cloneFormData(previousFormData) : new FormData();
            nextFormData.set(field, file, file.name);
            return nextFormData;
        });
    }, []);

    const onBrandNameChange = (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
        setShowMissingBrandName(false);
        setBrandName(e?.currentTarget?.value);
        setThemePayload(previousFormData => {
            const nextFormData = previousFormData ? cloneFormData(previousFormData) : new FormData();
            nextFormData.set(ThemeFormDataRequest.BRAND, e?.currentTarget?.value);
            return nextFormData;
        });
    };

    const removeFieldFromThemePayload = useCallback((field: string) => {
        setThemePayload(previousFormData => {
            if (previousFormData && previousFormData.has(field)) {
                const nextFormData = cloneFormData(previousFormData);
                nextFormData.delete(field);
                return nextFormData;
            }
            return previousFormData;
        });
    }, []);

    const logoPreview = (type: LogoTypes, file: File) => {
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
        reader.readAsDataURL(file); // Images, PDF, video, audio
    };

    const onLogoChange = (type: LogoTypes, files: File[]) => {
        const file = files[0];
        if (!file) return;
        addFileToThemePayload(type, file);
        logoPreview(type, file);
    };

    const onRemoveLogoUrl = (logoType: LogoTypes) => {
        removeFieldFromThemePayload(logoType);
        if (logoType === logoOptions.LOGO) {
            setLogoUrl(null);
        }
        if (logoType === logoOptions.FULL_WIDTH_LOGO) {
            setFullWidthLogoUrl(null);
        }
    };

    const getLogoUrl = (logoType: LogoTypes) => {
        return logoType === logoOptions.LOGO ? logoUrl : fullWidthLogoUrl;
    };

    return (
        <div className="adyen-pe-pay-by-link-theme-form">
            <div className="adyen-pe-pay-by-link-settings__input-container">
                <label htmlFor={brandInputId} aria-labelledby={brandInputId} className="adyen-pe-pay-by-link-theme-form__brand-input">
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('payByLink.settings.theme.brandName.input.label')}
                    </Typography>
                </label>
                <InputText type="text" lang={i18n.locale} uniqueId={brandInputId} value={brandName} onInput={onBrandNameChange} />
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
            <div className="adyen-pe-pay-by-link-settings__cta-container">
                <Button variant={ButtonVariant.PRIMARY} onClick={onSave}>
                    {i18n.get('payByLink.settings.common.action.save')}
                </Button>
            </div>
        </div>
    );
};

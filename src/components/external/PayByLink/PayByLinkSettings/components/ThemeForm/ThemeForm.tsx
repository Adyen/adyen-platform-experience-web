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
import { ImgHTMLAttributes } from 'preact/compat';

interface ThemeFormProps {
    theme?: {
        brandName?: string;
        logoUrl?: string;
        fullWidthLogoUrl?: string;
    };
    selectedStore: string;
}

const cloneFormData = (formData: FormData) => {
    const formDataClone = new FormData();
    for (const [field, value] of formData.entries()) {
        if (value instanceof File) {
            formDataClone.set(field, value, value.name);
        } else formDataClone.set(field, value);
    }
    return formDataClone;
};

export const ThemeForm = ({ theme, selectedStore }: ThemeFormProps) => {
    const initialBrandName = useRef<string | undefined>(theme?.brandName);
    const [brandName, setBrandName] = useState(theme?.brandName ?? undefined);
    const [logoUrl, setLogoUrl] = useState(theme?.logoUrl ?? undefined);
    const [fullWidthLogoUrl, setFullWidthLogoUrl] = useState(theme?.fullWidthLogoUrl ?? undefined);
    const [themePayload, setThemePayload] = useState<FormData | null>(null);
    const [showMissingBrandName, setShowMissingBrandName] = useState(false);
    const [logoPreview, setLogoPreview] = useState(false);
    const [fullWidthLogoPreview, setFullWidthLogoPreview] = useState(false);
    const logoPreviewAreaRef = useRef<ImgHTMLAttributes<HTMLImageElement>>();
    const fullWidthLogoPreviewAreaRef = useRef<ImgHTMLAttributes<HTMLImageElement>>();

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

    const onSave = useCallback(() => {
        if (!brandName) {
            setShowMissingBrandName(true);
            return;
        }
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
            nextFormData.set('brandName', e?.currentTarget?.value);
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

    const onLogoChange = (files: File[]) => {
        const file = files[0];
        if (!file) return;

        addFileToThemePayload('logoUrl', file);
        showPreview('logoPreview', file);
    };

    const showPreview = (type: string, file: File) => {
        let previewAreaRef: ImgHTMLAttributes<HTMLImageElement> | null = null;
        if (type === 'logoPreview') {
            previewAreaRef = logoPreviewAreaRef?.current ? logoPreviewAreaRef.current : null;
        }
        if (type === 'fullWidthLogoPreview') {
            previewAreaRef = fullWidthLogoPreviewAreaRef?.current ? fullWidthLogoPreviewAreaRef.current : null;
        }
        if (!file || !previewAreaRef) return;

        previewAreaRef.innerHTML = ''; // Clear old preview

        const reader = new FileReader();

        reader.onload = function (e) {
            const result = e?.target?.result;

            if (file.type.startsWith('image/') && result) {
                const img = document.createElement('img');
                previewAreaRef.src = result;
                previewAreaRef.style.display = 'block';
                previewAreaRef.appendChild(img);
                if (type === 'logoPreview') {
                    setLogoPreview(true);
                }
                if (type === 'fullWidthLogoPreview') {
                    setFullWidthLogoPreview(true);
                }
            }
        };
        reader.readAsDataURL(file); // Images, PDF, video, audio
    };

    const onFullWidthLogoChange = (files: File[]) => {
        const file = files[0];
        if (!file) return;
        addFileToThemePayload('fullWidthLogoUrl', file);
        showPreview('fullWidthLogoPreview', file);
    };

    const onRemoveLogoUrl = useCallback(() => {
        setLogoUrl(undefined);
        removeFieldFromThemePayload('logoUrl');
    }, [setLogoUrl, removeFieldFromThemePayload]);

    const onRemoveFullWidthLogoUrl = useCallback(() => {
        setFullWidthLogoUrl(undefined);
        removeFieldFromThemePayload('fullWidthLogoUrl');
    }, [setFullWidthLogoUrl, removeFieldFromThemePayload]);

    const onRemoveFullWidthLogoPreview = () => {
        removeFieldFromThemePayload('fullWidthLogoUrl');
        const element = fullWidthLogoPreviewAreaRef.current.childElementCount; // 3
        // loop will continue until the "ele" has a child.
        while (element.lastChild) {
            element.lastChild.remove(); //remove the last child of "ele"
        }
        setFullWidthLogoPreview(false);
        fullWidthLogoPreviewAreaRef.current.style.display = 'none';
    };

    const onRemoveLogoPreview = () => {
        removeFieldFromThemePayload('logoUrl');
        const element = logoPreviewAreaRef.current.childElementCount; // 3
        // loop will continue until the "ele" has a child.
        while (element.lastChild) {
            element.lastChild.remove(); //removee the last child of "ele"
        }
        setLogoPreview(false);
        logoPreviewAreaRef.current.style.display = 'none';
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
            <div className="adyen-pe-pay-by-link-settings__input-container">
                <img id="previewArea" ref={logoPreviewAreaRef} alt={'logo-preview'} style={{ display: 'none' }} />
                {logoPreview && (
                    <Button
                        variant={ButtonVariant.PRIMARY}
                        onClick={onRemoveLogoPreview}
                        className="adyen-pe-pay-by-link-theme-form__preview--remove"
                    >
                        {i18n.get('payByLink.settings.theme.action.logo.remove')}
                    </Button>
                )}
            </div>
            {!logoPreview &&
                (logoUrl ? (
                    <div className="adyen-pe-pay-by-link-settings__input-container">
                        <img src={logoUrl} alt={'logo'} />
                        <Button variant={ButtonVariant.PRIMARY} onClick={onRemoveLogoUrl}>
                            {i18n.get('payByLink.settings.theme.action.logo.remove')}
                        </Button>
                    </div>
                ) : (
                    <div className="adyen-pe-pay-by-link-settings__input-container">
                        <label htmlFor={brandInputId} aria-labelledby={brandInputId} className="adyen-pe-pay-by-link-theme-form__file-input">
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                                {i18n.get('payByLink.settings.theme.brandLogo.input.label')}
                            </Typography>
                        </label>
                        <FileInput
                            maxFileSize={THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE}
                            allowedFileTypes={THEME_FORM_ALLOWED_FILE_TYPES}
                            onChange={onLogoChange}
                        />
                        <div className="adyen-pe-pay-by-link-theme-form__file-info-container">
                            <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                                {i18n.get('payByLink.settings.theme.limitations.file.input.supportedFile.text')}
                                {THEME_FORM_ALLOWED_FILE_TYPES.map(type => getHumanReadableFileName(type)).join(', ')}
                            </Typography>
                            <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                                {i18n.get('payByLink.settings.theme.limitations.file.input.supportedFile.text')}
                                {getHumanReadableFileSize(THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE)}
                            </Typography>
                            <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                                {i18n.get('payByLink.settings.theme.limitations.file.input.maxSize.logo.text')}
                            </Typography>
                        </div>
                    </div>
                ))}
            <div className="adyen-pe-pay-by-link-settings__input-container">
                <img id="previewArea" ref={fullWidthLogoPreviewAreaRef} alt={'logo-preview'} style={{ display: 'none' }} />
                {fullWidthLogoPreview && (
                    <Button
                        variant={ButtonVariant.PRIMARY}
                        onClick={onRemoveFullWidthLogoPreview}
                        className="adyen-pe-pay-by-link-theme-form__preview--remove"
                    >
                        {i18n.get('payByLink.settings.theme.action.logo.remove')}
                    </Button>
                )}
            </div>
            {!fullWidthLogoPreview &&
                (fullWidthLogoUrl ? (
                    <div className="adyen-pe-pay-by-link-settings__input-container">
                        <img src={fullWidthLogoUrl} alt={'logo'} />
                        <Button variant={ButtonVariant.PRIMARY} onClick={onRemoveFullWidthLogoUrl}>
                            {i18n.get('payByLink.settings.theme.action.logo.remove')}
                        </Button>
                    </div>
                ) : (
                    <div className="adyen-pe-pay-by-link-settings__input-container">
                        <label htmlFor={brandInputId} aria-labelledby={brandInputId} className="adyen-pe-pay-by-link-theme-form__file-input">
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                                {i18n.get('payByLink.settings.theme.brandWideLogo.input.label')}
                            </Typography>
                        </label>
                        <FileInput
                            maxFileSize={THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE}
                            allowedFileTypes={THEME_FORM_ALLOWED_FILE_TYPES}
                            onChange={onFullWidthLogoChange}
                        />
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
                                {i18n.get('payByLink.settings.theme.limitations.file.input.maxSize.fullWidthLogo.text')}
                            </Typography>
                        </div>
                    </div>
                ))}
            <div className="adyen-pe-pay-by-link-settings__cta-container">
                <Button variant={ButtonVariant.PRIMARY} onClick={onSave}>
                    {i18n.get('payByLink.settings.common.action.save')}
                </Button>
            </div>
        </div>
    );
};

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
import { useCallback, useState } from 'preact/hooks';
import { h } from 'preact';

interface ThemeFormProps {
    theme?: {
        brandName?: string | undefined;
        logoUrl?: string | undefined;
    };
    selectedStore: string;
}

export const ThemeForm = ({ theme, selectedStore }: ThemeFormProps) => {
    const [brandName, setBrandName] = useState(theme?.brandName ?? undefined);

    const brandInputId = useUniqueId();
    const { i18n } = useCoreContext();

    const { updatePayByLinkTheme } = useConfigContext().endpoints;

    const updatePayByLinkTermsAndConditions = useMutation({
        queryFn: updatePayByLinkTheme,
        options: {
            onSuccess: data => console.log(data),
        },
    });

    const onSave = useCallback(() => {
        if (!brandName) return;
        void updatePayByLinkTermsAndConditions.mutate(
            { contentType: 'multipart/form-data', body: { brandName: brandName! } },
            { path: { storeId: selectedStore! } }
        );
    }, [brandName, updatePayByLinkTermsAndConditions, selectedStore]);

    const onChange = (e: h.JSX.TargetedEvent<HTMLInputElement>) => setBrandName(e?.currentTarget?.value);

    return (
        <div className="adyen-pe-pay-by-link-theme-form">
            <div className="adyen-pe-pay-by-link-settings__input-container">
                <label htmlFor={brandInputId} aria-labelledby={brandInputId} className="adyen-pe-pay-by-link-theme-form__brand-input">
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('payByLink.settings.theme.brandName.input.label')}
                    </Typography>
                </label>
                <InputText type="text" lang={i18n.locale} uniqueId={brandInputId} value={brandName} onInput={onChange} />
            </div>
            <div className="adyen-pe-pay-by-link-settings__input-container">
                <label htmlFor={brandInputId} aria-labelledby={brandInputId} className="adyen-pe-pay-by-link-theme-form__file-input">
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('payByLink.settings.theme.brandLogo.input.label')}
                    </Typography>
                </label>
                <FileInput maxFileSize={THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE} allowedFileTypes={THEME_FORM_ALLOWED_FILE_TYPES} />
                <div className="adyen-pe-pay-by-link-theme-form__file-info-container">
                    <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                        {i18n.get('payByLink.settings.theme.limitations.file.input.supportedFile.text')}
                        {THEME_FORM_ALLOWED_FILE_TYPES.map(type => getHumanReadableFileName(type)).join(', ')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                        {i18n.get('payByLink.settings.theme.limitations.file.input.supportedFile.text')}
                        {getHumanReadableFileSize(THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE)}
                    </Typography>
                </div>
            </div>

            <div className="adyen-pe-pay-by-link-settings__input-container">
                <label htmlFor={brandInputId} aria-labelledby={brandInputId} className="adyen-pe-pay-by-link-theme-form__file-input">
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('payByLink.settings.theme.brandWideLogo.input.label')}
                    </Typography>
                </label>
                <FileInput maxFileSize={THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE} allowedFileTypes={THEME_FORM_ALLOWED_FILE_TYPES} />
                <div className="adyen-pe-pay-by-link-theme-form__file-info-container">
                    <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                        {i18n.get('payByLink.settings.theme.limitations.file.input.supportedFile.text')}
                        {THEME_FORM_ALLOWED_FILE_TYPES.map(type => getHumanReadableFileName(type)).join(', ')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                        {i18n.get('payByLink.settings.theme.limitations.file.input.supportedFile.text')}
                        {getHumanReadableFileSize(THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE)}
                    </Typography>
                </div>
            </div>

            <div className="adyen-pe-pay-by-link-settings__cta-container">
                <Button variant={ButtonVariant.PRIMARY} onClick={onSave}>
                    {i18n.get('payByLink.settings.common.action.save')}
                </Button>
            </div>
        </div>
    );
};

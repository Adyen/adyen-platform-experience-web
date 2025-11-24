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

interface ThemeFormProps {
    theme?: {
        brandName?: string | undefined;
        logoUrl?: string | undefined;
    };
}

export const ThemeForm = ({ theme }: ThemeFormProps) => {
    const brandInputId = useUniqueId();
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-pe-pay-by-link-theme-form">
            <label htmlFor={brandInputId} aria-labelledby={brandInputId} className="adyen-pe-pay-by-link-theme-form__brand-input">
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    Brand name
                </Typography>
                <InputText type="text" lang={i18n.locale} uniqueId={brandInputId} value={theme?.brandName} />
            </label>
            <label htmlFor={brandInputId} aria-labelledby={brandInputId} className="adyen-pe-pay-by-link-theme-form__file-input">
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    Brand logo
                </Typography>
                <FileInput maxFileSize={THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE} allowedFileTypes={THEME_FORM_ALLOWED_FILE_TYPES} />
            </label>
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-theme-form__file-info">
                Supported file types: {THEME_FORM_ALLOWED_FILE_TYPES.map(type => getHumanReadableFileName(type)).join(', ')}
                <br />
                Max file size: {getHumanReadableFileSize(THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE)}
            </Typography>
        </div>
    );
};

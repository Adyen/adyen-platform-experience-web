import { FC } from 'preact/compat';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../../../internal/Typography/types';
import { logoOptions, THEME_FORM_ALLOWED_FILE_TYPES, THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE } from '../ThemeForm/constants';
import { getHumanReadableFileName } from '../../../../../../../utils/file/naming';
import { getHumanReadableFileSize } from '../../../../../../../utils';
import { LogoTypes } from '../../types';

const getImageSizeLimitation = (logoType: LogoTypes) => {
    switch (logoType) {
        case logoOptions.FULL_WIDTH_LOGO:
            return '300 x 30 px';
        case logoOptions.LOGO:
        default:
            return '200 x 200 px';
    }
};

const LogoRequirements: FC<{ logoType: LogoTypes }> = ({ logoType }: { logoType: LogoTypes }) => {
    const { i18n } = useCoreContext();

    const logoFileInformationText = getImageSizeLimitation(logoType);

    return (
        <div className="adyen-pe-payment-link-theme-form__file-info-container">
            <Typography variant={TypographyVariant.BODY} className="adyen-pe-payment-link-theme-form__file-info">
                {i18n.get('payByLink.settings.theme.limitations.file.input.supportedFile.text')}
                {THEME_FORM_ALLOWED_FILE_TYPES.map(type => getHumanReadableFileName(type)).join(', ')}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="adyen-pe-payment-link-theme-form__file-info">
                {i18n.get('payByLink.settings.theme.limitations.file.input.maxSize.text')}
                {getHumanReadableFileSize(THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE)}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="adyen-pe-payment-link-theme-form__file-info">
                {i18n.get('payByLink.settings.theme.limitations.file.input.imageSize.text')}
                {logoFileInformationText}
            </Typography>
        </div>
    );
};

export default LogoRequirements;

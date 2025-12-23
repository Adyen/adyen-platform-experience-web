import { FC } from 'preact/compat';
import { LogoTypes } from '../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import useUniqueId from '../../../../../../../../hooks/useUniqueId';
import { useCallback, useMemo } from 'preact/hooks';
import { TranslationKey } from '../../../../../../../../translations';
import { MapErrorCallback } from '../../../../../../DisputeManagement/components/DefendDisputeFlow/types';
import { validationErrors } from '../../../../../../../internal/FormFields/FileInput/constants';
import defaultMapError from '../../../../../../../internal/FormFields/FileInput/helpers/defaultMapError';
import Typography from '../../../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../../../internal/Typography/types';
import FileInput from '../../../../../../../internal/FormFields/FileInput/FileInput';
import { LogoLabel, logoOptions, THEME_FORM_ALLOWED_FILE_TYPES, THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE } from '../ThemeForm/constants';
import LogoRequirements from '../LogoRequirements/LogoRequirements';
import { ValidationError } from '../../../../../../../internal/FormFields/FileInput/types';

const getImageDimensionLimitation = (logoType: LogoTypes) => {
    switch (logoType) {
        case logoOptions.LOGO:
            return { width: 200, height: 200 };
        case logoOptions.FULL_WIDTH_LOGO:
        default:
            return { width: 300, height: 30 };
    }
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

    const dimensions: {
        width: number;
        height: number;
    } = useMemo(() => getImageDimensionLimitation(logoType), [logoType]);

    const dimensionError: TranslationKey = useMemo(
        () =>
            logoType === 'logo'
                ? 'payByLink.themes.inputs.file.errors.logo.maxDimension'
                : 'payByLink.themes.inputs.file.errors.fullWidthLogo.maxDimension',
        [logoType]
    );

    const mapError: MapErrorCallback = useCallback(
        (error: ValidationError) => {
            switch (error) {
                case validationErrors.MAX_DIMENSIONS:
                    return i18n.get(dimensionError);
                default:
                    return i18n.get(defaultMapError(error));
            }
        },
        [i18n, dimensionError]
    );

    return (
        <div className="adyen-pe-pay-by-link-settings__input-container">
            <label htmlFor={logoInputId} aria-labelledby={logoInputId} className="adyen-pe-pay-by-link-theme-form__file-input">
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {i18n.get(LogoLabel[logoType])}
                </Typography>
            </label>
            <FileInput
                maxDimensions={dimensions}
                maxFileSize={THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE}
                allowedFileTypes={THEME_FORM_ALLOWED_FILE_TYPES}
                onChange={onChange}
                id={logoInputId}
                mapError={mapError}
            />
            <LogoRequirements logoType={logoType} />
        </div>
    );
};

export default LogoInput;

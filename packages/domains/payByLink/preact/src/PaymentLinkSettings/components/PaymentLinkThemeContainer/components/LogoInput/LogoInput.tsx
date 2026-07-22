import { LogoTypes } from '../../types';
import { useCoreContext } from '@integration-components/core/preact';
import { useUniqueId } from '@integration-components/hooks-preact';
import { useCallback } from 'preact/hooks';
import type { BaseFileInputProps } from '@integration-components/ui-components-preact/FormFields/FileInput/types';
type MapErrorCallback = NonNullable<BaseFileInputProps['mapError']>;
import { validationErrors } from '@integration-components/ui-components-preact/FormFields/FileInput/constants';
import defaultMapError from '@integration-components/ui-components-preact/FormFields/FileInput/helpers/defaultMapError';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import FileInput from '@integration-components/ui-components-preact/FormFields/FileInput/FileInput';
import {
    LOGO_DIMENSION_ERROR,
    LOGO_DIMENSIONS,
    LogoLabel,
    THEME_FORM_ALLOWED_FILE_TYPES,
    THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE,
} from '../ThemeForm/constants';
import LogoRequirements from '../LogoRequirements/LogoRequirements';
import { ValidationError } from '@integration-components/ui-components-preact/FormFields/FileInput/types';

const LogoInput = ({
    disabled,
    logoType,
    onFileInputChange,
}: {
    disabled: boolean;
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

    const dimensions = LOGO_DIMENSIONS[logoType];
    const dimensionError = LOGO_DIMENSION_ERROR[logoType];

    const mapError: MapErrorCallback = useCallback(
        (error: ValidationError) => {
            switch (error) {
                case validationErrors.INVALID_DIMENSIONS:
                    return i18n.get(dimensionError);
                default:
                    return i18n.get(defaultMapError(error));
            }
        },
        [i18n, dimensionError]
    );

    return (
        <>
            <label htmlFor={logoInputId} aria-labelledby={logoInputId} className="adyen-pe-payment-link-theme-form__file-input">
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {i18n.get(LogoLabel[logoType])}
                </Typography>
                <Typography
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.BODY}
                    className="adyen-pe-payment-link-theme-form__field-label-optional"
                >
                    {`(${i18n.get('payByLink.common.fields.optional.label')})`}
                </Typography>
            </label>
            <FileInput
                disabled={disabled}
                validDimensions={dimensions}
                maxFileSize={THEME_FORM_UPLOAD_DOCUMENT_MAX_SIZE}
                allowedFileTypes={THEME_FORM_ALLOWED_FILE_TYPES}
                onChange={onChange}
                id={logoInputId}
                mapError={mapError}
            />
            <LogoRequirements logoType={logoType} />
        </>
    );
};

export default LogoInput;

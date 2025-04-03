import cx from 'classnames';
import { useCallback, useMemo, useState } from 'preact/hooks';
import Typography from '../../../Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useFocusVisibility from '../../../../../hooks/element/useFocusVisibility';
import { BASE_CLASS, DEFAULT_FILE_TYPES, DEFAULT_MAX_FILE_SIZE } from '../constants';
import { getUploadedFilesFromSource, uniqueId, UploadedFileSource } from '../../../../../utils';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { DropzoneProps } from '../types';
import Icon from '../../../Icon';
import '../FileInput.scss';

const classes = {
    dropzone: `${BASE_CLASS}__dropzone`,
    dropzoneHover: `${BASE_CLASS}__dropzone--hover`,
    label: `${BASE_CLASS}__label`,
    labelIcon: `${BASE_CLASS}__label-icon`,
    labelText: `${BASE_CLASS}__label-text`,
    labelWithFocus: `${BASE_CLASS}__label--with-focus`,
};

export function Dropzone({
    id,
    name,
    label,
    disabled = false,
    required = false,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedFileTypes = DEFAULT_FILE_TYPES,
    setFiles,
}: DropzoneProps) {
    const { i18n } = useCoreContext();
    const { hasVisibleFocus, ref: inputRef } = useFocusVisibility<HTMLInputElement>();
    const [zoneHover, setZoneHover] = useState(false);

    const inputId = useMemo(() => id || uniqueId(), [id]);

    const handleDragOver = (event: DragEvent) => {
        const hasFiles = Array.from(event.dataTransfer?.types ?? []).some(type => type === 'Files');
        if (hasFiles) {
            event.preventDefault();
            setZoneHover(true);
        }
    };

    const handleDragLeave = (event: DragEvent) => {
        event.preventDefault();
        setZoneHover(false);
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        setZoneHover(false);
        updateFiles(event.dataTransfer);
    };

    const handleFileChange = (event: Event) => {
        updateFiles(event.target as HTMLInputElement);
    };

    const updateFiles = useCallback(
        <T extends UploadedFileSource>(source?: T | null) => {
            const allowedFiles = getUploadedFilesFromSource(source).filter(file => {
                return file.size <= maxFileSize && allowedFileTypes.includes(file.type);
            });
            setFiles(allowedFiles.slice(0, 1));
        },
        [allowedFileTypes, maxFileSize, setFiles]
    );

    return (
        <div
            role="region"
            className={cx(classes.dropzone, { [classes.dropzoneHover]: zoneHover })}
            onDragOver={disabled ? undefined : handleDragOver}
            onDragLeave={disabled ? undefined : handleDragLeave}
            onDrop={disabled ? undefined : handleDrop}
        >
            {/* Using the label element here to expose sufficient interaction surface for the file input element. */}
            {/* The input element itself is visually hidden (not visible), but available to assistive technology. */}
            <label className={cx(classes.label, { [classes.labelWithFocus]: hasVisibleFocus })} htmlFor={inputId}>
                <Icon name="upload" className={classes.labelIcon} />
                <Typography
                    /* Using the styles for the tertiary button here to have the same look and feel */
                    className={cx(classes.labelText, 'adyen-pe-button', 'adyen-pe-button--tertiary')}
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.BODY}
                >
                    {i18n.get(label || 'uploadFile.browse')}
                </Typography>
            </label>

            <input
                type="file"
                name={name}
                id={inputId}
                className="adyen-pe-visually-hidden"
                ref={inputRef}
                disabled={disabled}
                multiple={false}
                accept={String(allowedFileTypes)}
                onChange={handleFileChange}
                aria-required={required}
                data-testId="dropzone-input"
            />
        </div>
    );
}

export default Dropzone;

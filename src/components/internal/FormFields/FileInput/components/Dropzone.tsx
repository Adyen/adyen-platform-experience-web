import cx from 'classnames';
import { useCallback, useState } from 'preact/hooks';
import Typography from '../../../Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useFocusVisibility from '../../../../../hooks/element/useFocusVisibility';
import { BASE_CLASS, DEFAULT_FILE_TYPES, DEFAULT_MAX_FILE_SIZE } from '../constants';
import { getUploadedFilesFromSource, UploadedFileSource } from '../../../../../utils';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { DropzoneProps } from '../types';
import Icon from '../../../Icon';
import '../FileInput.scss';

const classes = {
    dropzone: `${BASE_CLASS}__dropzone`,
    dropzoneHover: `${BASE_CLASS}__dropzone--drag-hover`,
    label: `${BASE_CLASS}__label`,
    labelWithFocus: `${BASE_CLASS}__label--with-focus-ring`,
    labelContent: `${BASE_CLASS}__label-content`,
    labelIcon: `${BASE_CLASS}__label-icon`,
    labelText: `${BASE_CLASS}__label-text`,
    field: `${BASE_CLASS}__field`,
};

export function Dropzone({
    // [TODO]: Apply these ignored props to the file input element
    // id,
    // name,
    // label = '',
    disabled = false,
    required = false,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedFileTypes = DEFAULT_FILE_TYPES,
    setFiles,
}: DropzoneProps) {
    const [dragHover, setDragHover] = useState(false);
    const { hasVisibleFocus, ref: inputRef } = useFocusVisibility<HTMLInputElement>();
    const { i18n } = useCoreContext();

    const handleDragOver = (event: DragEvent) => {
        const hasFiles = Array.from(event.dataTransfer?.types ?? []).some(type => type === 'Files');
        if (hasFiles) {
            event.preventDefault();
            setDragHover(true);
        }
    };

    const handleDragLeave = (event: DragEvent) => {
        event.preventDefault();
        setDragHover(false);
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        setDragHover(false);
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
            className={cx(classes.dropzone, { [classes.dropzoneHover]: dragHover })}
            onDragOver={disabled ? undefined : handleDragOver}
            onDragLeave={disabled ? undefined : handleDragLeave}
            onDrop={disabled ? undefined : handleDrop}
        >
            <label className={cx(classes.label, { [classes.labelWithFocus]: hasVisibleFocus })} htmlFor="input-field-id">
                <div className={classes.labelContent}>
                    <Icon name="upload" className={classes.labelIcon} />
                    <Typography
                        /* Using the styles for the tertiary button here to have the same look and feel */
                        className={cx(classes.labelText, 'adyen-pe-button', 'adyen-pe-button--tertiary')}
                        el={TypographyElement.SPAN}
                        variant={TypographyVariant.BODY}
                    >
                        {i18n.get('uploadFile.browse')}
                    </Typography>
                </div>

                {/* Using nested input in label element technique here to expose interaction surface for the file input. */}
                {/* The input element itself is visually hidden (not visible on screen), but available to screen readers. */}
                <input
                    type="file"
                    id="input-field-id"
                    className={cx(classes.field, 'adyen-pe-visually-hidden')}
                    ref={inputRef}
                    disabled={disabled}
                    multiple={false}
                    accept={String(allowedFileTypes)}
                    onChange={handleFileChange}
                    aria-required={required}
                    data-testId="dropzone-input"
                />
            </label>
        </div>
    );
}

export default Dropzone;

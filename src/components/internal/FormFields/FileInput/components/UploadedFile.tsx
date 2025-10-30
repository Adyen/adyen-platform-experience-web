import Icon from '../../../Icon';
import Button from '../../../Button/Button';
import Typography from '../../../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { getHumanReadableFileSize } from '../../../../../utils';
import { ButtonVariant } from '../../../Button/types';
import { Translation } from '../../../Translation';
import { UploadedFileProps } from '../types';
import { BASE_CLASS } from '../constants';
import { useMemo } from 'preact/hooks';
import '../FileInput.scss';

const classes = {
    fileBase: `${BASE_CLASS}__file`,
    fileButton: `${BASE_CLASS}__file-button`,
    fileDetails: `${BASE_CLASS}__file-details`,
    fileIcon: `${BASE_CLASS}__file-icon`,
    fileName: `${BASE_CLASS}__file-name`,
    fileSize: `${BASE_CLASS}__file-size`,
};

export function UploadedFile({ file, deleteFile, disabled }: UploadedFileProps) {
    const fileSize = useMemo(() => getHumanReadableFileSize(file.size), [file.size]);
    return (
        <div className={classes.fileBase}>
            <div className={classes.fileDetails}>
                <Icon name="checkmark-circle-fill" className={classes.fileIcon} />
                <div className={classes.fileName} title={file.name}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {file.name}
                    </Typography>
                </div>
                <Typography className={classes.fileSize} el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {fileSize}
                </Typography>
            </div>
            <Button className={classes.fileButton} disabled={disabled} variant={ButtonVariant.TERTIARY} onClick={deleteFile}>
                <Icon name="trash-can" />
                {/* The content of this span is used as accessible name for the delete (icon) button. */}
                {/* However, it is visually hidden (not visible), but available to assistive technology. */}
                <span className="adyen-pe-visually-hidden">
                    <Translation translationKey="common.inputs.file.actions.delete" fills={{ filename: file.name }} />
                </span>
            </Button>
        </div>
    );
}

export default UploadedFile;

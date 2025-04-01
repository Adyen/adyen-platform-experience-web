import Icon from '../../../Icon';
import Button from '../../../Button/Button';
import Typography from '../../../Typography/Typography';
import { getHumanReadableFileSize } from '../../../../../utils';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { ButtonVariant } from '../../../Button/types';
import { UploadedFileProps } from '../types';
import '../FileInput.scss';

export function UploadedFile({ file, deleteFile }: UploadedFileProps) {
    return (
        <div className="adyen-pe-file-input__file">
            <div className="adyen-pe-file-input__file-details">
                <i className="adyen-pe-file-input__file-icon">
                    <Icon name="checkmark-circle-fill" />
                </i>
                <Typography className="adyen-pe-file-input__file-name" el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {file.name}
                </Typography>
                <Typography className="adyen-pe-file-input__file-size" el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {getHumanReadableFileSize(file.size)}
                </Typography>
            </div>
            <Button className="adyen-pe-file-input__file-button" variant={ButtonVariant.TERTIARY} onClick={deleteFile}>
                <Icon name="trash-can" />
            </Button>
        </div>
    );
}

export default UploadedFile;

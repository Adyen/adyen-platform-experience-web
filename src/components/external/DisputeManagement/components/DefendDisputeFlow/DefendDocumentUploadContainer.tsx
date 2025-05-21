import FileInput from '../../../../internal/FormFields/FileInput/FileInput';
import { getDefenseDocumentContent } from '../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { IDisputeDefenseDocument } from '../../../../../types/api/models/disputes';
import { MutableRef } from 'preact/hooks';

export const DefendDocumentUploadContainer = ({
    document,
    ref,
    addFileToDefendPayload,
}: {
    document: IDisputeDefenseDocument;
    ref: MutableRef<HTMLInputElement | null>;
    addFileToDefendPayload: (name: string, file: File) => void;
}) => {
    const { i18n } = useCoreContext();
    const { title, description } = getDefenseDocumentContent(i18n, document.documentTypeCode) || {};
    return (
        <div className="adyen-pe-defend-dispute-document-container">
            <Typography
                strongest
                className="adyen-pe-defend-dispute-document-container__title"
                variant={TypographyVariant.BODY}
                el={TypographyElement.SPAN}
            >
                {title || document.documentTypeCode}
            </Typography>
            {description && description.length > 0
                ? description.map((desc, i) => {
                      return (
                          <Typography
                              key={`${i}-description`}
                              className="adyen-pe-defend-dispute-document-container__description"
                              variant={TypographyVariant.BODY}
                          >
                              {desc}
                          </Typography>
                      );
                  })
                : null}
            <FileInput
                ref={ref}
                key={document}
                required={document.requirementLevel === 'REQUIRED'}
                onChange={file => {
                    if (file[0]) addFileToDefendPayload(document.documentTypeCode, file[0]);
                }}
            />
        </div>
    );
};

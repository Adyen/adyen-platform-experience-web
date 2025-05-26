import FileInput from '../../../../internal/FormFields/FileInput/FileInput';
import { getDefenseDocumentContent } from '../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { MutableRef } from 'preact/hooks';

export const DefendDocumentUpload = ({
    document,
    ref,
    addFileToDefendPayload,
    isRequired,
}: {
    document: string;
    ref: MutableRef<HTMLInputElement | null>;
    addFileToDefendPayload: (name: string, file: File) => void;
    isRequired: boolean;
}) => {
    const { i18n } = useCoreContext();
    const { title, description } = getDefenseDocumentContent(i18n, document) || {};
    return (
        <div className="adyen-pe-defend-dispute-document-upload">
            <div>
                <Typography
                    strongest
                    className="adyen-pe-defend-dispute-document-upload__title"
                    variant={TypographyVariant.BODY}
                    el={TypographyElement.SPAN}
                >
                    {title || document}
                </Typography>
                {description && description.length > 0
                    ? description.map((desc, i) => {
                          return (
                              <Typography
                                  key={`${i}-description`}
                                  className="adyen-pe-defend-dispute-document-upload__description"
                                  variant={TypographyVariant.BODY}
                              >
                                  {desc}
                              </Typography>
                          );
                      })
                    : null}
            </div>
            <FileInput
                ref={ref}
                key={document}
                required={isRequired}
                onChange={file => {
                    if (file[0]) addFileToDefendPayload(document, file[0]);
                }}
            />
        </div>
    );
};

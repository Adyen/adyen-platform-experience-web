import FileInput from '../../../../internal/FormFields/FileInput/FileInput';
import { getDefenseDocumentContent } from '../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { MutableRef, useMemo } from 'preact/hooks';
import { useDisputeFlow } from '../../context/dispute/context';

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
    const { title, primaryDescriptionItems } = useMemo(() => getDefenseDocumentContent(i18n, document), [i18n, document]) || {};
    const { removeFieldFromDefendPayload } = useDisputeFlow();
    return (
        <div className="adyen-pe-defend-dispute-document-upload">
            <div>
                <Typography
                    strongest
                    className="adyen-pe-defend-dispute-document-upload__title"
                    variant={TypographyVariant.BODY}
                    el={TypographyElement.DIV}
                >
                    {title || document}
                </Typography>
                {primaryDescriptionItems && primaryDescriptionItems.length > 0
                    ? primaryDescriptionItems.map((desc, i) => {
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
                onChange={files => {
                    files[0] ? addFileToDefendPayload(document, files[0]) : removeFieldFromDefendPayload(document);
                }}
            />
        </div>
    );
};

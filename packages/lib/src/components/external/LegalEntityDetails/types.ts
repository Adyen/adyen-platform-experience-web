import { UIElementProps } from '../../types';
import { ILegalEntityIndividual, ILegalEntityOrganization, ILegalEntitySoleProprietor } from '../../../types/models/api/legal-entities';
import { TransferInstrument } from '../../../types/models/transferInstrument';

export type GetTransferInstrumentById = (id: string) => Promise<TransferInstrument>;
export interface LegalEntityDetailsProps extends UIElementProps {
    legalEntity?: ILegalEntityOrganization | ILegalEntityIndividual | ILegalEntitySoleProprietor;
    legalEntityId: string;
    onGetTransferInstrument?: GetTransferInstrumentById;
}

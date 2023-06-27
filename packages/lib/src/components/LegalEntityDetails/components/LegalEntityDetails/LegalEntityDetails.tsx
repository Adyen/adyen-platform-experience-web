import './LegalEntityDetails.scss';
import { LegalEntityDetailsProps } from '../../types';
import Card from '../../../internal/Card/Card';
import LegalEntityIndividual from '../LegalEntityIndividual/LegalEntityIndividual';
import LegalEntityOrganization from '../LegalEntityOrganization/LegalEntityOrganization';
import LegalEntitySoleProprietor from '../LegalEntitySoleProprietor/LegalEntitySoleProprietor';

const LegalEntityDetails = ({ legalEntity, onGetTransferInstrument }: LegalEntityDetailsProps) => {
    return (
        <div className="adyen-legal-entity">
            <Card>
                {legalEntity?.type === 'individual' ? (
                    <LegalEntityIndividual legalEntity={legalEntity} />
                ) : legalEntity?.type === 'organization' ? (
                    <LegalEntityOrganization legalEntity={legalEntity} onGetTransferInstrument={onGetTransferInstrument} />
                ) : legalEntity?.type === 'soleProprietorship' ? (
                    <LegalEntitySoleProprietor legalEntity={legalEntity} />
                ) : null}
            </Card>
        </div>
    );
};

export default LegalEntityDetails;

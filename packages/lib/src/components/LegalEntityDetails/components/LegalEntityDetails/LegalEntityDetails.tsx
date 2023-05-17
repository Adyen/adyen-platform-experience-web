import './LegalEntityDetails.scss';
import { LegalEntityDetailsProps } from '../../types';
import LegalEntityIndividual from '../LegalEntityIndividual/LegalEntityIndividual';
import LegalEntityOrganization from '../LegalEntityOrganization/LegalEntityOrganization';
import LegalEntitySoleProprietor from '../LegalEntitySoleProprietor/LegalEntitySoleProprietor';
import Card from '../../../internal/Card/Card';
import useCoreContext from '../../../../core/Context/useCoreContext';
const LegalEntityDetails = ({ legalEntity, onGetTransferInstrument }: LegalEntityDetailsProps) => {
    const { i18n } = useCoreContext();
    return (
        <div className="adyen-legal-entity">
            <p className="adyen-fp-title">{i18n.get('legalEntityDetails')}</p>

            <Card>
                {legalEntity.type === 'individual' ? (
                    <LegalEntityIndividual legalEntity={legalEntity} />
                ) : legalEntity.type === 'organization' ? (
                    <LegalEntityOrganization legalEntity={legalEntity} onGetTransferInstrument={onGetTransferInstrument} />
                ) : legalEntity.type === 'soleProprietorship' ? (
                    <LegalEntitySoleProprietor legalEntity={legalEntity} />
                ) : null}
            </Card>
        </div>
    );
};

export default LegalEntityDetails;

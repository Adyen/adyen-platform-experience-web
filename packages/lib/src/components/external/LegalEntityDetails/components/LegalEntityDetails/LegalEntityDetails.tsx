import { LegalEntityDetailsProps } from '../../types';
import Card from '../../../../internal/Card/Card';
import './LegalEntityDetails.scss';
import LegalEntityIndividual from '../LegalEntityIndividual/LegalEntityIndividual';
import LegalEntityOrganization from '../LegalEntityOrganization/LegalEntityOrganization';
import LegalEntitySoleProprietor from '../LegalEntitySoleProprietor/LegalEntitySoleProprietor';
import { useFetch } from '@src/hooks/useFetch/useFetch';
import { ILegalEntityIndividual, ILegalEntityOrganization, ILegalEntitySoleProprietor } from '@src/types';
import Spinner from '@src/components/internal/Spinner';
import Alert from '@src/components/internal/Alert';
import useCoreContext from '@src/core/Context/useCoreContext';

const LegalEntityDetails = ({ legalEntity, legalEntityId, onGetTransferInstrument }: LegalEntityDetailsProps) => {
    const { i18n } = useCoreContext();

    const { data, error, isFetching } = useFetch<ILegalEntityOrganization | ILegalEntityIndividual | ILegalEntitySoleProprietor>(
        { url: `legalEntities/${legalEntityId}` },
        { enabled: !!legalEntityId && !legalEntity }
    );

    const legalEntityData = legalEntity ?? data;

    return (
        <div className="adyen-fp-legal-entity">
            <Card classNameModifiers={['adyen-fp-legal-entity__container']}>
                {isFetching && <Spinner />}
                {error && <Alert icon={'cross'}>{error.message ?? i18n.get('unableToLoadLegalEntity')}</Alert>}
                {legalEntityData?.type === 'individual' ? (
                    <LegalEntityIndividual legalEntity={legalEntityData} />
                ) : legalEntityData?.type === 'organization' ? (
                    <LegalEntityOrganization legalEntity={legalEntityData} onGetTransferInstrument={onGetTransferInstrument} />
                ) : legalEntityData?.type === 'soleProprietorship' ? (
                    <LegalEntitySoleProprietor legalEntity={legalEntityData} />
                ) : null}
            </Card>
        </div>
    );
};

export default LegalEntityDetails;

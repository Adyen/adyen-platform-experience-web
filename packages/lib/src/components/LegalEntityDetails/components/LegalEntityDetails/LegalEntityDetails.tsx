import './LegalEntityDetails.scss';
import { LegalEntityDetailsProps } from '../../types';
import Card from '../../../internal/Card/Card';
import LoadingWrapper from '@src/components/internal/LoadingWrapper';
import { Suspense, lazy } from 'preact/compat';

const LegalEntityIndividual = lazy(() => import('../LegalEntityIndividual/LegalEntityIndividual'));
const LegalEntityOrganization = lazy(() => import('../LegalEntityOrganization/LegalEntityOrganization'));
const LegalEntitySoleProprietor = lazy(() => import('../LegalEntitySoleProprietor/LegalEntitySoleProprietor'));

const LegalEntityDetails = ({ legalEntity, onGetTransferInstrument }: LegalEntityDetailsProps) => {
    return (
        <div className="adyen-legal-entity">
            <Suspense fallback={<LoadingWrapper />}>
                <Card>
                    {legalEntity?.type === 'individual' ? (
                        <LegalEntityIndividual legalEntity={legalEntity} />
                    ) : legalEntity?.type === 'organization' ? (
                        <LegalEntityOrganization legalEntity={legalEntity} onGetTransferInstrument={onGetTransferInstrument} />
                    ) : legalEntity?.type === 'soleProprietorship' ? (
                        <LegalEntitySoleProprietor legalEntity={legalEntity} />
                    ) : null}
                </Card>
            </Suspense>
        </div>
    );
};

export default LegalEntityDetails;

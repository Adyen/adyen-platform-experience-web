import { GetTransferInstrumentById, TransferInstrument, TransferInstrumentOverview } from '../../types';
import Card from '../../../internal/Card/Card';
import './LegalEntityOrganization.scss';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { useState } from 'preact/hooks';

interface TransferInstrumentProps {
    transferInstrument: TransferInstrumentOverview;
    onGetTransferInstrument?: GetTransferInstrumentById;
}
function TransferInstrumentOverview({ transferInstrument, onGetTransferInstrument }: TransferInstrumentProps) {
    const { i18n } = useCoreContext();

    const [transferInstrumentDetails, setTransferInstrumentDetails] = useState<TransferInstrument>();

    const getTransferInstrumentDetails = async () => setTransferInstrumentDetails(await onGetTransferInstrument?.(transferInstrument.id));

    return (
        <div className="adyen-fp-legal-entity-organization--transfer-instrument">
            <Card
                filled
                noOutline
                collapsible
                openByDefault={false}
                renderHeader={
                    <div className="adyen-fp-legal-entity-organization--transfer-instrument__container">
                        <div className="adyen-fp-legal-entity-organization--transfer-instrument__element-container">
                            <span className="adyen-fp-legal-entity-organization--transfer-instrument__element-label">
                                {i18n.get('transferInstrumentId')}
                            </span>
                            <span
                                className="adyen-fp-legal-entity-organization--transfer-instrument__id"
                                role="button"
                                tabIndex={0}
                                onClick={getTransferInstrumentDetails}
                            >
                                {transferInstrument.id}
                            </span>
                        </div>
                        <div className="adyen-fp-legal-entity-organization--transfer-instrument__element-container">
                            <span className="adyen-fp-legal-entity-organization--transfer-instrument__element-label">
                                {i18n.get('accountIdentifier')}
                            </span>
                            <span className="adyen-fp-legal-entity-organization--transfer-instrument__account">
                                {transferInstrument.accountIdentifier}
                            </span>
                        </div>
                    </div>
                }
            >
                <p>test</p>
                <p>test</p>
                <p>test</p>
            </Card>
        </div>
    );
}

export default TransferInstrumentOverview;

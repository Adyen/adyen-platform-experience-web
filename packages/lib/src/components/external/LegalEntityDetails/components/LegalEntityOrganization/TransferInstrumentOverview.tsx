import { GetTransferInstrumentById } from '../../types';
import Card from '../../../../internal/Card/Card';
import './LegalEntityOrganization.scss';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useState } from 'preact/hooks';
import { TransferInstrument, TransferInstrumentOv } from '../../../../../types/models/transferInstrument';

interface TransferInstrumentProps {
    transferInstrument: TransferInstrumentOv;
    onGetTransferInstrument?: GetTransferInstrumentById;
}
function TransferInstrumentOverview({ transferInstrument, onGetTransferInstrument }: TransferInstrumentProps) {
    const { i18n } = useCoreContext();

    // TODO remove the eslint-disable-next-line comment below once the component to display the component for displaying the transfer instrument details is created
    // eslint-disable-next-line
    const [transferInstrumentDetails, setTransferInstrumentDetails] = useState<TransferInstrument>();

    const getTransferInstrumentDetails = async () => setTransferInstrumentDetails(await onGetTransferInstrument?.(transferInstrument.id));

    return (
        <div className="adyen-fp-legal-entity-organization--transfer-instrument">
            <Card
                filled
                noOutline
                collapsible={Boolean(onGetTransferInstrument)}
                openByDefault={false}
                renderHeader={
                    <div className="adyen-fp-legal-entity-organization__transfer-instrument-container">
                        <div className="adyen-fp-legal-entity-organization__transfer-instrument-element-container">
                            <span className="adyen-fp-legal-entity-organization__transfer-instrument-element-label">
                                {i18n.get('transferInstrumentId')}
                            </span>
                            <span className="adyen-fp-legal-entity-organization__transfer-instrument-id">{transferInstrument.id}</span>
                        </div>
                        <div className="adyen-fp-legal-entity-organization__transfer-instrument-element-container">
                            <span className="adyen-fp-legal-entity-organization__transfer-instrument-element-label">
                                {i18n.get('accountIdentifier')}
                            </span>
                            <span className="adyen-fp-legal-entity-organization__transfer-instrument-account">
                                {transferInstrument.accountIdentifier}
                            </span>
                        </div>
                    </div>
                }
                onClickHandler={getTransferInstrumentDetails}
            >
                {/*TODO create a component to display the details of a transfer instrument that could be used either independently or within this component. */}
            </Card>
        </div>
    );
}

export default TransferInstrumentOverview;

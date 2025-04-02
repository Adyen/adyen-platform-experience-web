import useCoreContext from '../../../../../core/Context/useCoreContext';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import StatusBox from '../../../../internal/StatusBox/StatusBox';
import { DISPUTE_DATA_CONTAINER, DISPUTE_STATUS_BOX } from './constants';
import DisputeDataProperties from './DisputeDataProperties';
import './DisputeData.scss';

export const DisputeData = ({ dispute, isFetching }: { dispute: IDisputeDetail; isFetching: boolean }) => {
    const { i18n } = useCoreContext();

    if (!dispute || isFetching) return null;

    return (
        <div className={DISPUTE_DATA_CONTAINER}>
            <div className={DISPUTE_STATUS_BOX}>
                <StatusBox type={'dispute'} dispute={dispute}></StatusBox>
            </div>

            <DisputeDataProperties dispute={dispute} />

            {dispute?.status === 'action_needed' ? <ButtonActions actions={[{ title: i18n.get('disputes.accept'), event: () => {} }]} /> : null}
        </div>
    );
};

export default DisputeData;

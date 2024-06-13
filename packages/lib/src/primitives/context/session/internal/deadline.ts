import { struct } from '../../../../utils';
import type { Emitter } from '../../../reactive/eventEmitter';
import type { SessionEventType, SessionSpecification } from '../types';

export const createSessionDeadlineManager = <T extends any>(emitter: Emitter<SessionEventType>, specification: SessionSpecification<T>) => {
    return struct();
};

export default createSessionDeadlineManager;

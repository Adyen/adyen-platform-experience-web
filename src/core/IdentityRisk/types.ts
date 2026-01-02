import { DevEnvironment } from '../types';
import { SessionRequest } from '../ConfigContext';

export interface RiskModuleProps {
    env?: DevEnvironment;
    getToken: SessionRequest;
}

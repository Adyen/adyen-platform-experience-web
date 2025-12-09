import * as identityRiskSdk from '@adyen/identityrisk-data-collection/devicefingerprint.js';
import { RiskModuleProps } from './types';
import { DevEnvironment } from '../types';
import { httpPost } from '../Http/http';

export class RiskModule {
    public irclUrl = '';
    private getToken: any;

    constructor(props: RiskModuleProps) {
        this.getIrcUrl(props.env);
        this.getToken = props.getToken;
    }

    getIrcUrl(env: DevEnvironment = 'test') {
        this.irclUrl = `https://ircl-${env}.adyen.com/ircl/jwtservices/v1`;
    }

    async getFingerPrint() {
        return await identityRiskSdk.adyenGetData();
    }

    async sendLoginEvent() {
        const deviceDetails = await this.getFingerPrint();
        const { token } = await this.getToken();

        await httpPost<any>({
            loadingContext: this.irclUrl,
            path: 'fingerprint/submitLegalEntity',
            versionless: true,
            body: {
                eventType: 'login',
                deviceDetails,
            },
            headers: { Authorization: `Bearer ${token}`, 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        });
    }
}

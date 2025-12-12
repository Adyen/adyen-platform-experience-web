import { RiskModuleProps } from './types';
import { DevEnvironment } from '../types';
import { httpPost } from '../Http/http';
import { SessionRequest } from '../ConfigContext';

export class RiskModule {
    private irclUrl = '';
    private readonly getToken: SessionRequest;
    private static readonly version = 'v1';

    constructor(props: RiskModuleProps) {
        this.setIrcUrl(props.env);
        this.getToken = props.getToken;
    }

    setIrcUrl(env: DevEnvironment = 'test') {
        this.irclUrl = `https://ircl-${env}.adyen.com/ircl/jwtservices/${RiskModule.version}`;
    }

    async getFingerPrint() {
        // @ts-expect-error - No type definitions for this package
        // eslint-disable-next-line import/no-extraneous-dependencies,import/extensions
        const identityRiskSdk = await import(/* @vite-ignore */ '@adyen/identityrisk-data-collection/devicefingerprint.js');
        return identityRiskSdk.adyenGetData();
    }

    async sendLoginEvent() {
        const deviceDetails = await this.getFingerPrint();
        const controller = new AbortController();
        const session = await this.getToken(controller.signal);

        if (session && session.token) {
            try {
                await httpPost<any>({
                    loadingContext: this.irclUrl,
                    path: 'fingerprint/submitAccountHolder',
                    versionless: true,
                    body: {
                        eventType: 'login',
                        deviceDetails,
                    },
                    headers: { Authorization: `Bearer ${session.token}` },
                });
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.warn(error);
            }
        }
    }
}

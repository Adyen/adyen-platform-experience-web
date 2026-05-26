import { CUSTOM_URL_EXAMPLE } from '@integration-components/testing/storybook-helpers';
import { IDisputeListItem } from '@integration-components/types/api/models/disputes';

export const getCustomDisputesData = async (data: IDisputeListItem[]) => {
    return data.map(dispute => {
        return {
            ...dispute,
            _summary: {
                type: 'link',
                value: 'Summary',
                config: {
                    href: CUSTOM_URL_EXAMPLE,
                },
            },
            _sendEmail: {
                type: 'button',
                value: 'Send email',
                config: {
                    action: () => console.log('Action'),
                },
            },
        } as const;
    });
};

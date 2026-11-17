import type { Meta } from '@storybook/vue3';
import { ElementProps, ElementStory } from '@integration-components/testing/storybook-helpers';
import type { PietExternalProps } from '../../src';
import { PIET_MOCK_CHAT_URL } from '../../../mocks/endpoints';
import { PIET_CHAT_HANDLERS } from '../../../mocks/mock-server/piet';
import { pietMeta } from './meta';

const meta: Meta<ElementProps<PietExternalProps>> = { ...pietMeta, title: 'Mocked/Piet/Piet' };

const defaultArgs = {
    mockedApi: true,
    chat: { url: PIET_MOCK_CHAT_URL, model: 'piet-mock' },
    // The real flows are other domains' components, mounted by the host (see the API-connected story).
    renderAction: (request, container) => {
        container.textContent = `The host would mount the "${request.type}" flow here.`;
        return () => container.replaceChildren();
    },
} satisfies Partial<ElementProps<PietExternalProps>>;

export const Default: ElementStory<PietExternalProps> = {
    name: 'Default',
    args: defaultArgs,
};

export const NoChat: ElementStory<PietExternalProps> = {
    name: 'No chat configured',
    args: { mockedApi: true },
};

export const NonStreaming: ElementStory<PietExternalProps> = {
    name: 'Non-streaming reply',
    args: { ...defaultArgs, chat: { ...defaultArgs.chat, stream: false } },
};

export const SlowStream: ElementStory<PietExternalProps> = {
    name: 'Slow stream',
    args: defaultArgs,
    parameters: {
        msw: { ...PIET_CHAT_HANDLERS.slowStream },
    },
};

export const ErrorReply: ElementStory<PietExternalProps> = {
    name: 'Error - Reply',
    args: defaultArgs,
    parameters: {
        msw: { ...PIET_CHAT_HANDLERS.error },
    },
};

export default meta;

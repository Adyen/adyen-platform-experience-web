import type { Meta } from '@storybook/vue3';
import { ElementProps, ElementStory, EMPTY_SESSION_OBJECT, SessionControls } from '@integration-components/testing/storybook-helpers';
import type { PietExternalProps } from '../../src';
import { PIET_ACTION_INSTRUCTIONS, PIET_FORMATTING_INSTRUCTIONS, PIET_REPLY_OPTIONS_INSTRUCTIONS, PIET_SYSTEM_PROMPT } from '../../../domain/src';
// Stories may use the SDK to host the other domains' components that Piet opens for suggested actions.
import { renderPietAction } from '../../../../../sdk/stories/pietActionHost';
import { pietMeta } from './meta';

const meta: Meta<ElementProps<PietExternalProps>> = { ...pietMeta, title: 'API-connected/Piet/Piet' };

/**
 * Talks to an OpenAI-compatible chat backend through the dev-server proxy at `/api/piet-chat`, which targets `PIET_CHAT_API_URL`
 * and adds the bearer token from `PIET_CHAT_API_KEY` (see `envs/env.default`). The model comes from `PIET_CHAT_MODEL` and must be one your backend serves.
 * The tools run against the session's own endpoints.
 */
export const Default: ElementStory<PietExternalProps, SessionControls> = {
    name: 'Default',
    args: {
        session: EMPTY_SESSION_OBJECT,
        chat: {
            url: '/api/piet-chat/v1/chat/completions',
            model: process.env.PIET_CHAT_MODEL ?? 'chat-model',
            systemPrompt: [PIET_SYSTEM_PROMPT, PIET_FORMATTING_INSTRUCTIONS, PIET_REPLY_OPTIONS_INSTRUCTIONS, PIET_ACTION_INSTRUCTIONS].join('\n\n'),
        },
        renderAction: renderPietAction,
    },
};

export default meta;

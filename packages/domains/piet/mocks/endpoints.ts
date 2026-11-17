import { MSW_BASE_URL } from '@integration-components/testing/msw';

export const PIET_ENDPOINTS = {
    chatCompletions: `${MSW_BASE_URL}/piet/chat/completions`,
} as const;

/** Concrete URL that matches `PIET_ENDPOINTS.chatCompletions`, for stories that configure `chat.url`. */
export const PIET_MOCK_CHAT_URL = 'https://platform-components-external-test.adyen.com/platform-components-external/api/v1/piet/chat/completions';

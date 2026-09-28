import { AdyenPlatformExperience } from '@integration-components/sdk-internal';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta = {
    title: 'SDK/Metadata',
};

export default meta;

/**
 * Rendering this story evaluates the SDK bundle (the same module graph a host page loads).
 */
export const Default: StoryObj = {
    render: () => ({
        // Referencing the `AdyenPlatformExperience` export keeps bundlers from tree-shaking
        // any side-effect chains (e.g. entry -> global) out of the static Storybook build.
        setup: () => ({ sdkLoaded: typeof AdyenPlatformExperience === 'function' }),
        template: '<div data-testid="sdk-harness">{{ sdkLoaded ? "SDK loaded" : "SDK unavailable" }}</div>',
    }),
};

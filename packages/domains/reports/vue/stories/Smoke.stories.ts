import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent, ref, onMounted } from 'vue';

// Smoke story — validates that the storybook-vue tool package boots, renders
// a Vue 3 component, and that msw-storybook-addon actually intercepts fetches.
// Hits the same mocked sessions endpoint used by the Preact stories; if MSW is
// wired correctly the returned id will be `test-id` (see mocks/mock-server/sessions.ts).
// Replace once real domain Vue stories exist.

const SmokeComponent = defineComponent({
    name: 'SmokeComponent',
    setup() {
        const sessionId = ref<string>('(fetching…)');
        onMounted(async () => {
            try {
                const res = await fetch('/api/authe/api/v1/sessions', { method: 'POST' });
                const body = await res.json();
                sessionId.value = body.id ?? '(no id in response)';
            } catch (err) {
                sessionId.value = `(fetch failed: ${err instanceof Error ? err.message : String(err)})`;
            }
        });
        return { sessionId };
    },
    template: `
        <div style="padding: 16px; font-family: system-ui, sans-serif;">
            <h2>Vue 3 Storybook smoke</h2>
            <p>Mocked session id: <strong>{{ sessionId }}</strong></p>
        </div>
    `,
});

const meta: Meta<typeof SmokeComponent> = {
    title: 'Vue/smoke',
    component: SmokeComponent,
};

export default meta;

type Story = StoryObj<typeof SmokeComponent>;

export const Default: Story = {
    args: { mockedApi: true },
};

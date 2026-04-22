// Placeholder Container for Vue Storybook.
//
// Finalized in 04-03 (Vue pilot) — see implementation-plan.md section `04-03 Vue pilot`.
// The real Container will mirror the Preact version in packages/tools/storybook-preact/src/utils/Container.tsx:
//   - accept a component constructor and configuration via props/args
//   - bootstrap `AdyenPlatformExperienceVue` (or the finalized Vue public API)
//   - mount the component into a container ref on setup, unmount on teardown
//   - forward locale/fontFamily globals via context
//
// The shape below locks in the public API footprint so domain Vue stories can be
// authored against it before the implementation lands. Do not rely on this stub
// in production code; it exists purely to anchor the API surface.

import type { Component } from 'vue';

export interface ContainerProps {
    component: Component;
    componentConfiguration: Record<string, unknown>;
    mockedApi?: boolean;
}

export const Container = {
    name: 'PlaceholderContainer',
    props: {
        component: { type: Object, required: true },
        componentConfiguration: { type: Object, required: true },
        mockedApi: { type: Boolean, default: false },
    },
    setup() {
        return () => null;
    },
};

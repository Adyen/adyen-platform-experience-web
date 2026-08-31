import { BREAKPOINTS } from '@integration-components/utils';
import type { ValueOfRecord } from '@integration-components/utils/types';

export const containerQueries = {
    up: {
        sm: ['up', BREAKPOINTS.sm],
        md: ['up', BREAKPOINTS.md],
        lg: ['up', BREAKPOINTS.lg],
    },
    down: {
        xs: ['down', BREAKPOINTS.sm - 1],
        sm: ['down', BREAKPOINTS.md - 1],
        md: ['down', BREAKPOINTS.lg - 1],
    },
    only: {
        xs: ['only', BREAKPOINTS.sm - 1, { max: BREAKPOINTS.sm - 1 }],
        sm: ['only', BREAKPOINTS.sm, { max: BREAKPOINTS.md - 1 }],
        md: ['only', BREAKPOINTS.md, { max: BREAKPOINTS.lg - 1 }],
        lg: ['only', BREAKPOINTS.lg, { min: BREAKPOINTS.lg }],
    },
} as const;

type ContainerQueries = typeof containerQueries;

export type ResponsiveViewportContainerQuery = ValueOfRecord<{
    [K in keyof ContainerQueries]: ValueOfRecord<ContainerQueries[K]>;
}>;

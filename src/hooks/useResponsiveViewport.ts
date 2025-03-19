import { BREAKPOINTS } from '../constants';
import type { ValueOfRecord } from '../utils/types';
import { useContainerQuery } from './useContainerQuery';

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

type _ContainerQueries = typeof containerQueries;

export type ResponsiveViewportContainerQuery = ValueOfRecord<{
    [K in keyof _ContainerQueries]: ValueOfRecord<_ContainerQueries[K]>;
}>;

export const useResponsiveViewport = useContainerQuery<ResponsiveViewportContainerQuery>;

import { BREAKPOINTS } from '../constants';
import type { ValueOfRecord } from '../utils/types';
import { useContainerQuery } from './useContainerQuery';

export const mediaQueries = {
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
        sm: ['only', BREAKPOINTS.sm],
        md: ['only', BREAKPOINTS.md],
        lg: ['only', BREAKPOINTS.lg, { min: BREAKPOINTS.lg }],
    },
} as const;

type _MediaQueries = typeof mediaQueries;

export type ResponsiveViewportMediaQuery = ValueOfRecord<{
    [K in keyof _MediaQueries]: ValueOfRecord<_MediaQueries[K]>;
}>;

export const useResponsiveViewport = useContainerQuery<ResponsiveViewportMediaQuery>;

import { BREAKPOINTS } from '../constants';
import { useMediaQuery } from './useMediaQuery';
import type { ValueOfRecord } from '../utils/types';

export const mediaQueries = {
    up: {
        sm: `(min-width: ${BREAKPOINTS.sm}px)`,
        md: `(min-width: ${BREAKPOINTS.md}px)`,
        lg: `(min-width: ${BREAKPOINTS.lg}px)`,
    },
    down: {
        xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
        sm: `(max-width: ${BREAKPOINTS.md - 1}px)`,
        md: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
    },
    only: {
        xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
        sm: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
        md: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
        lg: `(min-width: ${BREAKPOINTS.lg}px)`,
    },
} as const;

type _MediaQueries = typeof mediaQueries;

export type ResponsiveViewportMediaQuery = ValueOfRecord<
    | {
          [K in keyof _MediaQueries]: ValueOfRecord<_MediaQueries[K]>;
      }
    | { hello: `(prefers-color-scheme: dark)` }
>;

export const useResponsiveViewport = useMediaQuery<ResponsiveViewportMediaQuery>;

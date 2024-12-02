/* eslint-disable import/no-relative-packages */
import { lazy } from 'preact/compat';

/**
 * Icons are fetched from @adyen/ui-assets-icons-16 package
 * @see https://adyen-ui-assets.netlify.app/
 *
 * This is a subset of the available icons in the package, not because
 * of a specific optimization, but vite needs complete paths to icons as
 * shown below for static analysis.
 *
 * How to add a new icon?
 * Search for it in the url/package above, add the entry below changing
 * the object key and the svg filename.
 */
export const svgs = {
    // icons
    checkmark: lazy(() => import('@adyen/ui-assets-icons-16/svg/checkmark.svg?component')),
    'checkmark-circle-fill': lazy(() => import('@adyen/ui-assets-icons-16/svg/checkmark-circle-fill.svg?component')),
    'checkmark-square-fill': lazy(() => import('@adyen/ui-assets-icons-16/svg/checkmark-square-fill.svg?component')),
    'chevron-down': lazy(() => import('@adyen/ui-assets-icons-16/svg/chevron-down.svg?component')),
    'chevron-left': lazy(() => import('@adyen/ui-assets-icons-16/svg/chevron-left.svg?component')),
    'chevron-right': lazy(() => import('@adyen/ui-assets-icons-16/svg/chevron-right.svg?component')),
    'chevron-up': lazy(() => import('@adyen/ui-assets-icons-16/svg/chevron-up.svg?component')),
    copy: lazy(() => import('@adyen/ui-assets-icons-16/svg/copy.svg?component')),
    cross: lazy(() => import('@adyen/ui-assets-icons-16/svg/cross.svg?component')),
    'cross-circle-fill': lazy(() => import('@adyen/ui-assets-icons-16/svg/cross-circle-fill.svg?component')),
    download: lazy(() => import('@adyen/ui-assets-icons-16/svg/download.svg?component')),
    filter: lazy(() => import('@adyen/ui-assets-icons-16/svg/filter.svg?component')),
    'info-filled': lazy(() => import('@adyen/ui-assets-icons-16/svg/info-filled.svg?component')),
    'minus-circle-outline': lazy(() => import('@adyen/ui-assets-icons-16/svg/minus-circle.svg?component')),
    'plus-circle-outline': lazy(() => import('@adyen/ui-assets-icons-16/svg/plus-circle.svg?component')),
    square: lazy(() => import('@adyen/ui-assets-icons-16/svg/square.svg?component')),
    warning: lazy(() => import('@adyen/ui-assets-icons-16/svg/warning.svg?component')),
    'warning-filled': lazy(() => import('@adyen/ui-assets-icons-16/svg/warning-filled.svg?component')),
} as const;

// TODO: see Svg.tsx, this is a temporary solution
export const unscalableIconNames = [
    'checkmark',
    'checkmark-circle-fill',
    'checkmark-square-fill',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'chevron-up',
    'copy',
    'cross',
    'cross-circle-fill',
    'download',
    'filter',
    'info-filled',
    'minus-circle-outline',
    'plus-circle-outline',
    'square',
    'warning',
    'warning-filled',
];

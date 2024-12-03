/* eslint import/no-relative-packages: 0 */ // --> OFF
import './Svg.scss';

import cx from 'classnames';
import { Ref } from 'preact';
import { Suspense, SVGProps } from 'preact/compat';

import { svgs, unscalableIconNames } from './svgs';

export type SvgName = keyof typeof svgs;

export interface SvgProps extends Omit<SVGProps<SVGElement>, 'ref'> {
    name: SvgName;
    alt?: string;
    className?: string;
    testId?: string;
}

export const Svg = ({ className, name, testId, alt, ...props }: SvgProps & { ref?: Ref<SVGSVGElement> }) => {
    const LazyLoadedSvg = svgs[name];
    /**
     * TODO: temporary solution to add a viewbox to the ui-asset-icons
     * If the package gets the viewbox we can safely remove this
     * If it doesn't we can remove the package and go back to non-package icons
     *
     * This is used as a conditional below to make sure that svg that have a viewbox
     * do not see it getting removed by viewBox={undefined}
     */
    const viewBox = unscalableIconNames.includes(name) ? '0 0 16 16' : undefined;

    if (!LazyLoadedSvg) {
        console.error(`No such svg: "${name}"`);
        return null;
    }

    return (
        <span className={cx(`adyen-fp-icon`, className)} data-testid={testId}>
            <Suspense fallback={null}>
                {viewBox ? (
                    <LazyLoadedSvg alt={alt} aria-hidden={true} viewBox={viewBox} {...props} />
                ) : (
                    <LazyLoadedSvg alt={alt} aria-hidden={true} {...props} />
                )}
            </Suspense>
        </span>
    );
};

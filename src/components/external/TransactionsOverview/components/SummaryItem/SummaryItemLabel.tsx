import { LABEL_CLASS, LABEL_CONTAINER_CLASS, LABEL_CONTAINER_CLASS_LOADING } from './constants';
import { SummaryItemLabelProps } from './types';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { fixedForwardRef } from '../../../../../utils/preact';
import classNames from 'classnames';
import { ForwardedRef } from 'preact/compat';

export const SummaryItemLabel = fixedForwardRef(
    ({ config, i18n, isSkeletonVisible, className, ...restArgs }: SummaryItemLabelProps, ref: ForwardedRef<HTMLSpanElement>) => {
        return (
            <span
                className={classNames(LABEL_CONTAINER_CLASS, className, { [LABEL_CONTAINER_CLASS_LOADING]: isSkeletonVisible })}
                style={{ cursor: 'default' }}
                ref={ref}
                {...restArgs}
            >
                {config.labelKey && (
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} className={LABEL_CLASS}>
                        {i18n.get(config.labelKey)}
                    </Typography>
                )}
            </span>
        );
    }
);

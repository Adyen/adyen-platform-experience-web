import cx from 'classnames';
import { TagProps, TagVariant } from './types';
import './Tag.scss';
import { memo, PropsWithChildren } from 'preact/compat';
export const Tag = memo(({ variant = TagVariant.DEFAULT, label, children }: PropsWithChildren<TagProps>) => {
    return (
        <div
            className={cx('adyen-pe-tag', {
                // [TODO]: These Bento tag variants definitions are outdated
                'adyen-pe-tag--success': variant === TagVariant.SUCCESS,
                'adyen-pe-tag--default': variant === TagVariant.DEFAULT,
                'adyen-pe-tag--warning': variant === TagVariant.WARNING,
                'adyen-pe-tag--error': variant === TagVariant.ERROR,
                'adyen-pe-tag--primary': variant === TagVariant.WHITE,
                'adyen-pe-tag--light': variant === TagVariant.LIGHT,
                'adyen-pe-tag--light-with-outline': variant === TagVariant.LIGHT_WITH_OUTLINE,
                // Adopted from the latest Bento tag variants spec
                'adyen-pe-tag--blue': variant === TagVariant.BLUE,
            })}
        >
            {children || label}
        </div>
    );
});

import cx from 'classnames';
import './InfoBox.scss';
import { ComponentChildren, JSX } from 'preact';

interface InfoBoxProps {
    /**
     * Optional custom class name to apply additional styles to the InfoBox component.
     */
    className?: string;
    /**
     * The HTML tag to be used for rendering the InfoBox.
     *
     * @default 'div'
     */
    el?: JSX.ElementType;
    /**
     * Children elements to be rendered inside the InfoBox.
     */
    children?: ComponentChildren;
}

const InfoBox = ({ className, el: InfoBoxTag = 'div', children }: InfoBoxProps) => (
    <InfoBoxTag className={cx('adyen-pe-info-box', className)}>{children}</InfoBoxTag>
);

export default InfoBox;

import { FunctionalComponent } from 'preact';
import { CSSProperties } from 'preact/compat';
import './ExternalPlatformElement.scss';
import cx from 'classnames';

interface ExternalPlatformElementProps {
    width?: string | number;
    style?: CSSProperties;
    className?: string;
    minHeight?: string;
}

export const ExternalPlatformElement: FunctionalComponent<ExternalPlatformElementProps> = ({
    children,
    width = '100%',
    minHeight = '150px',
    style,
    className,
}) => {
    const defaultStyles = {
        width: typeof width === 'number' ? `${width}px` : width,
        minHeight: minHeight,
        ...style,
    };

    return (
        <div className={cx([className, 'external-platform-element'])} style={defaultStyles}>
            {children}
        </div>
    );
};

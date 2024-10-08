// ExternalPlatformElement.tsx
import { FunctionalComponent } from 'preact';
import { CSSProperties } from 'preact/compat';

interface ExternalPlatformElementProps {
    width?: string | number;
    // Optional: Allow passing additional styles or class names
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
        backgroundColor: '#F7F7F8', // Grey background
        width: typeof width === 'number' ? `${width}px` : width,
        minHeight: minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '5px',
        border: '1px solid #DBDEE2',
        ...style, // Allow overriding or extending styles via props
    };

    return (
        <div className={className} style={defaultStyles}>
            {children}
        </div>
    );
};

import { useEffect, useState } from 'preact/hooks';

const SIZES = {
    small: 480,
    medium: 768,
    large: 1024,
};

export const useDeviceSizeCheck = (size: keyof typeof SIZES) => {
    const [width, setWidth] = useState<number>(window.innerWidth);
    const handleResize = () => {
        console.log(window.innerWidth);
        setWidth(window.innerWidth);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width <= SIZES[size];
};

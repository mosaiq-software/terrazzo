import { useViewportSize } from '@mantine/hooks';

export const useIsMobile = () => {
    const { width } = useViewportSize();
    return width <= 768;
};

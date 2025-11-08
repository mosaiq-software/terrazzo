import { useEffect } from 'react';

interface UseCatchSaveKeyOptions {
    onSave?: () => void;
    enabled?: boolean;
}
export const useCatchSaveKey = (options?: UseCatchSaveKeyOptions) => {
    const { onSave, enabled = true } = options || {};

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (enabled && (e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                e.stopPropagation();
                onSave?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onSave, enabled]);
};

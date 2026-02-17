import { Vibrant } from 'node-vibrant/browser';
import React from 'react';

export type imageColorType = 'Vibrant' | 'Muted' | 'DarkVibrant' | 'DarkMuted' | 'LightVibrant' | 'LightMuted';

export const useImageColor = (src?: string, type?: imageColorType) => {
    const [color, setColor] = React.useState<string | undefined>(undefined);

    React.useMemo(() => {
        if (src) {
            try {
                Vibrant.from(src)
                    .getPalette()
                    .catch(() => {
                        console.error('Error getting palette');
                        setColor(undefined);
                    })
                    .then((palette) => {
                        setColor(palette[type || 'Vibrant']?.hex || undefined);
                    });
            } catch (error) {
                console.error(error);
                setColor(undefined);
            }
        } else {
            setColor(undefined);
        }
    }, [src]);

    return color;
};

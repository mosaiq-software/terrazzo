import { AnyExtensionConstructor } from '@remirror/core';
import { useHasExtension } from '@remirror/react-core';
import { FC, ReactNode } from 'react';

export interface IfExtensionPresentProps {
    extension: AnyExtensionConstructor;
    children?: ReactNode;
}

export const IfExtensionPresent: FC<IfExtensionPresentProps> = ({ children, extension }) => {
    const hasExtension = useHasExtension(extension);

    return hasExtension ? <>{children}</> : null;
};

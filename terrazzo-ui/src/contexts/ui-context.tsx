import React, { createContext, useContext, useState } from 'react';

export type UiContextType = {
    animationDuration: number;
    navbarHeight: number;
    pageTitle: string;
    setPageTitle: React.Dispatch<React.SetStateAction<string>>;
};

const UiContext = createContext<UiContextType | undefined>(undefined);

const UiProvider: React.FC<any> = ({ children }) => {
    const [animationDuration] = useState<number>(500);
    const [navbarHeight, setNavbarHeight] = useState<number>(50);
    const [pageTitle, setPageTitle] = useState<string>('');

    return (
        <UiContext.Provider
            value={{
                animationDuration,
                navbarHeight,
                pageTitle,
                setPageTitle,
            }}
        >
            {children}
        </UiContext.Provider>
    );
};

const useUI = () => {
    const context = useContext(UiContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UiProvider');
    }
    return context;
};

export { UiProvider, useUI };

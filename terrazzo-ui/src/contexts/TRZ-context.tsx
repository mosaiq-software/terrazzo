import React, { createContext, useContext, useState } from 'react';
import { BoardRes } from '@mosaiq/terrazzo-common/types';
import { useSocketListener } from '@trz/hooks/useSocketListener';
import { ServerSE } from '@mosaiq/terrazzo-common/socketTypes';

export type TRZContextType = {
    navbarHeight: number;
    boardData: BoardRes | undefined;
    setBoardData: React.Dispatch<React.SetStateAction<BoardRes | undefined>>;
};

const TRZContext = createContext<TRZContextType | undefined>(undefined);

const TRZProvider: React.FC<any> = ({ children }) => {
    const [navbarHeight, setNavbarHeight] = useState<number>(50);
    const [boardData, setBoardData] = useState<BoardRes | undefined>(undefined);

    useSocketListener<ServerSE.UPDATE_BOARD_LABELS>(ServerSE.UPDATE_BOARD_LABELS, (payload) => {
        setBoardData((prev) => {
            if (prev?.id !== payload.boardId) {
                return prev;
            }
            return { ...prev, labels: payload.labels };
        });
    });

    return (
        <TRZContext.Provider
            value={{
                navbarHeight,
                boardData,
                setBoardData,
            }}
        >
            {children}
        </TRZContext.Provider>
    );
};

const useTRZ = () => {
    const context = useContext(TRZContext);
    if (context === undefined) {
        throw new Error('useTRZ must be used within a TRZProvider');
    }
    return context;
};

export { TRZProvider, useTRZ };

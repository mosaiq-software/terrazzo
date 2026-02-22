import { useStatelessMap } from '@trz/hooks/useStatelessMap';
import React, { createContext, useContext, useEffect } from 'react';

export type DataSourcesContextType = {
    subscribe: (id: string, callback: (data: string) => void) => void;
    unsubscribe: (id: string) => void;
};

const DataSourcesContext = createContext<DataSourcesContextType | undefined>(undefined);

interface Subscriber {
    id: string;
    callback: (data: string) => void;
}

const DataSourcesProvider: React.FC<any> = ({ children }) => {
    const [subscribers, setSubscribers] = useStatelessMap<string, Subscriber>();

    useEffect(() => {
        // Every 3 seconds, send a message to a random subscriber
        const interval = setInterval(() => {
            const subscriberIds = Array.from(subscribers.keys());
            console.log('Attempting to send message to subscribers:', subscriberIds);
            if (subscriberIds.length === 0) return;
            const randomId = subscriberIds[Math.floor(Math.random() * subscriberIds.length)];
            const subscriber = subscribers.get(randomId);
            if (subscriber) {
                console.log(`Sending message to subscriber ${subscriber.id}`);
                subscriber.callback(`Hello ${new Date().getTime().toString().slice(-5)}`);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [subscribers]);

    const subscribe = (id: string, callback: (data: string) => void) => {
        console.log(`Subscribing ${id}`);
        subscribers.set(id, { id, callback });
    };

    const unsubscribe = (id: string) => {
        console.log(`Unsubscribing ${id}`);
        subscribers.delete(id);
    };

    return (
        <DataSourcesContext.Provider
            value={{
                subscribe,
                unsubscribe,
            }}
        >
            {children}
        </DataSourcesContext.Provider>
    );
};

const useDataSources = () => {
    const context = useContext(DataSourcesContext);
    if (context === undefined) {
        throw new Error('useDataSources must be used within a DataSourcesProvider');
    }
    return context;
};

const useDataSourcesSubscribe = () => {
    const id = React.useId();
    const [lastMessage, setLastMessage] = React.useState<string>('');
    // Dont need force update if a state update is triggered when a message is received, which will cause a re-render.
    // const forceUpdate = useForceUpdate();
    const { subscribe, unsubscribe } = useDataSources();

    console.log(`Setting up subscriber ${id}`);
    // Create a callback function that will be called when a message is sent to this subscriber. When received, force an update to re-render this component.
    const callback = (data: string) => {
        console.log(`Subscriber ${id} received:`, data);
        setLastMessage(data);
        // forceUpdate();
    };

    // Subscribe to the context when the component mounts, and unsubscribe when it unmounts
    useEffect(() => {
        subscribe(id, callback);
        return () => {
            unsubscribe(id);
        };
    }, [id, subscribe, unsubscribe]);

    return { lastMessage, id };
};

const TestDummy = () => {
    const { lastMessage, id } = useDataSourcesSubscribe();
    console.log(`Rendering subscriber ${id}`);
    return (
        <div>
            Subscriber {lastMessage}. Last updated at {new Date().getTime().toString().slice(-5)}.
        </div>
    );
};

export const TestGrounds = () => {
    const n = 5; // Number of subscribers
    return (
        <DataSourcesProvider>
            {Array.from({ length: n }, (_, i) => (
                <TestDummy key={i} />
            ))}
        </DataSourcesProvider>
    );
};

// export { DataSourcesProvider, useDataSources };

/**
 * Adapted from Mantine's use-map hook
 */
import { useForceUpdate } from '@mantine/hooks';
import { useRef } from 'react';

export function useMap<T, V>(initialState?: [T, V][]): [Map<T, V>, (map: Map<T, V> | [T, V][]) => void] {
    const mapRef = useRef(new Map<T, V>(initialState));
    const forceUpdate = useForceUpdate();

    mapRef.current.set = (...args) => {
        Map.prototype.set.apply(mapRef.current, args);
        forceUpdate();
        return mapRef.current;
    };

    mapRef.current.clear = (...args) => {
        Map.prototype.clear.apply(mapRef.current, args);
        forceUpdate();
    };

    mapRef.current.delete = (...args) => {
        const res = Map.prototype.delete.apply(mapRef.current, args);
        forceUpdate();

        return res;
    };

    mapRef.current.get = (...args) => {
        const res = Map.prototype.get.apply(mapRef.current, args);
        return res;
    };

    mapRef.current.has = (...args) => {
        const res = Map.prototype.has.apply(mapRef.current, args);
        return res;
    };

    mapRef.current.entries = (...args) => {
        const res = Map.prototype.entries.apply(mapRef.current, args);
        return res;
    };

    mapRef.current.keys = (...args) => {
        const res = Map.prototype.keys.apply(mapRef.current, args);
        return res;
    };

    mapRef.current.values = (...args) => {
        const res = Map.prototype.values.apply(mapRef.current, args);
        return res;
    };

    const setMap = (map: Map<T, V> | [T, V][]) => {
        mapRef.current = new Map(map);
        forceUpdate();
    };

    return [mapRef.current, setMap];
}

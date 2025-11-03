import {useEffect, useState} from "react";

export function useLocalStorage<T>(key: string, fallbackValue: T) {
    const [value, setValue] = useState(fallbackValue);
    useEffect(() => {
        const stored = localStorage.getItem(key);
        setValue(stored !== "" && stored !== null ? JSON.parse(stored) : fallbackValue);
        console.log(stored, JSON.parse(stored ?? '""'), fallbackValue);
        console.log(stored !== "" && stored !== null ? JSON.parse(stored) : fallbackValue);
    }, [fallbackValue, key]);

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}
import {useEffect, useState} from "react";

export function useLocalStorage<T>(key: string, fallbackValue: T) {
    const [value, setValue] = useState(fallbackValue);
    useEffect(() => {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                setValue(JSON.parse(stored));
            } catch {
                console.warn(`Invalid JSON in localStorage for key "${key}"`);
                setValue(fallbackValue);
            }
        } else {
            setValue(fallbackValue);
        }
        //setValue(stored !== "" && stored !== null ? JSON.parse(stored) : fallbackValue);
        //console.log(stored, JSON.parse(stored ?? '""'), fallbackValue);
        //console.log(stored !== "" && stored !== null ? JSON.parse(stored) : fallbackValue);
    }, [fallbackValue, key]);

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.warn(`Failed to save "${key}" to localStorage`);
        }
        //localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}
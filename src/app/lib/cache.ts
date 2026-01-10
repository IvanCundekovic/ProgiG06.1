/**
 * NF-011: Osnovna caching strategija
 * Simple in-memory cache za API odgovore
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live u milisekundama
}

class SimpleCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();

    /**
     * Dohvati podatke iz cache-a
     * @param key - Cache ključ
     * @returns Cached podatke ili null ako nisu u cache-u ili su istekli
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;
        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            // Cache entry je istekao
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Spremi podatke u cache
     * @param key - Cache ključ
     * @param data - Podaci za spremanje
     * @param ttl - Time to live u milisekundama (default: 5 minuta)
     */
    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    /**
     * Obriši podatke iz cache-a
     * @param key - Cache ključ
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Obriši sve podatke iz cache-a
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Očisti istekle cache entry-je
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

// Singleton instance
export const cache = new SimpleCache();

// Očisti istekle entry-je svakih 10 minuta
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        cache.cleanup();
    }, 10 * 60 * 1000);
}

/**
 * Cache helper za API rute
 * @param key - Cache ključ
 * @param fetcher - Funkcija koja dohvaća podatke ako nisu u cache-u
 * @param ttl - Time to live u milisekundama
 * @returns Cached ili fresh podatke
 */
export async function getCachedOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached !== null) {
        return cached;
    }

    const data = await fetcher();
    cache.set(key, data, ttl);
    return data;
}

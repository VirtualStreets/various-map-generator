export class LRUCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private maxSize: number) { }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export class CacheManager {
  private caches = new Map<string, LRUCache<string, any>>();
  private lastUsedProvider: string | null = null;

  getCache(provider: string): LRUCache<string, any> {
    if (!this.caches.has(provider)) {
      this.checkTotalCacheSize();
      this.caches.set(provider, new LRUCache(500));
    }
    this.lastUsedProvider = provider;
    return this.caches.get(provider)!;
  }

  get(provider: string, key: string): any {
    const cache = this.getCache(provider);
    return cache.get(key);
  }

  set(provider: string, key: string, value: any): void {
    const cache = this.getCache(provider);
    cache.set(key, value);
  }

  has(provider: string, key: string): boolean {
    const cache = this.getCache(provider);
    return cache.has(key);
  }

  clearCache(provider: string): void {
    const cache = this.caches.get(provider);
    if (cache) {
      cache.clear();
    }
  }

  clearAllCaches(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  private checkTotalCacheSize(): void {
    let total = 0;
    for (const cache of this.caches.values()) {
      total += cache.size;
    }
    if (total > 5000 && this.lastUsedProvider) {
      for (const [provider, cache] of this.caches.entries()) {
        if (provider !== this.lastUsedProvider) {
          cache.clear();
        }
      }
    }
  }
}

export const cacheManager = new CacheManager();

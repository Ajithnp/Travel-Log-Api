export interface ICacheService {
  get<T>(key: string): Promise<T | null>;

  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  exists(key: string): Promise<number>;

  del(key: string): Promise<void>;

  ttl(key: string): Promise<number>;

  clearPrefix(prefix: string): Promise<void>;
}

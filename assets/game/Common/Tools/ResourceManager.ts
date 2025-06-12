/**
 * 統一資源管理器
 * 負責資源的加載、緩存、釋放和生命周期管理
 */
export class ResourceManager {
    private static instance: ResourceManager = null;
    private loadedAssets: Map<string, cc.Asset> = new Map();
    private assetRefCount: Map<string, number> = new Map();
    private loadingPromises: Map<string, Promise<any>> = new Map();
    private maxCacheSize: number = 100; // 最大緩存數量
    private memoryWarningThreshold: number = 0.8; // 內存警告閾值

    public static getInstance(): ResourceManager {
        if (!this.instance) {
            this.instance = new ResourceManager();
        }
        return this.instance;
    }

    /**
     * 加載資源（帶緩存）
     */
    public async loadAsset<T extends cc.Asset>(
        path: string, 
        type?: typeof cc.Asset,
        bundle?: cc.AssetManager.Bundle
    ): Promise<T> {
        const cacheKey = `${bundle ? bundle.name : 'resources'}:${path}`;
        
        // 檢查緩存
        if (this.loadedAssets.has(cacheKey)) {
            this.incrementRefCount(cacheKey);
            return this.loadedAssets.get(cacheKey) as T;
        }

        // 防止重複加載
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        // 開始加載
        const loadPromise = new Promise<T>((resolve, reject) => {
            const loadBundle = bundle || cc.resources;
            
            if (type) {
                loadBundle.load(path, type, (err: Error, asset: cc.Asset) => {
                    if (err) {
                        console.error(`Failed to load asset: ${path}`, err);
                        reject(err);
                        return;
                    }

                    // 檢查緩存大小
                    this.checkCacheSize();
                    
                    this.loadedAssets.set(cacheKey, asset);
                    this.incrementRefCount(cacheKey);
                    resolve(asset as T);
                });
            } else {
                loadBundle.load(path, (err: Error, asset: cc.Asset) => {
                    if (err) {
                        console.error(`Failed to load asset: ${path}`, err);
                        reject(err);
                        return;
                    }

                    // 檢查緩存大小
                    this.checkCacheSize();
                    
                    this.loadedAssets.set(cacheKey, asset);
                    this.incrementRefCount(cacheKey);
                    resolve(asset as T);
                });
            }
        });

        this.loadingPromises.set(cacheKey, loadPromise);
        
        try {
            const result = await loadPromise;
            return result;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * 預加載資源列表
     */
    public async preloadAssets(paths: string[], type?: typeof cc.Asset): Promise<void> {
        const loadPromises = paths.map(path => this.loadAsset(path, type));
        await Promise.all(loadPromises);
        cc.log(`[ResourceManager] Preloaded ${paths.length} assets`);
    }

    /**
     * 釋放資源
     */
    public releaseAsset(path: string, bundle?: cc.AssetManager.Bundle): void {
        const cacheKey = `${bundle ? bundle.name : 'resources'}:${path}`;
        
        if (!this.loadedAssets.has(cacheKey)) {
            return;
        }

        this.decrementRefCount(cacheKey);
        
        // 當引用計數為0時才真正釋放
        if (this.getRefCount(cacheKey) <= 0) {
            const asset = this.loadedAssets.get(cacheKey);
            if (asset) {
                cc.assetManager.releaseAsset(asset);
                this.loadedAssets.delete(cacheKey);
                this.assetRefCount.delete(cacheKey);
                cc.log(`[ResourceManager] Released asset: ${cacheKey}`);
            }
        }
    }

    /**
     * 釋放所有資源
     */
    public releaseAll(): void {
        this.loadedAssets.forEach((asset, key) => {
            cc.assetManager.releaseAsset(asset);
        });
        
        this.loadedAssets.clear();
        this.assetRefCount.clear();
        this.loadingPromises.clear();
        
        cc.log("[ResourceManager] Released all assets");
    }

    /**
     * 獲取緩存統計
     */
    public getCacheStats(): {count: number, memoryUsage: number} {
        return {
            count: this.loadedAssets.size,
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * 清理未使用的資源
     */
    public cleanup(): void {
        const toRemove: string[] = [];
        
        this.assetRefCount.forEach((count, key) => {
            if (count <= 0) {
                toRemove.push(key);
            }
        });

        toRemove.forEach(key => {
            const asset = this.loadedAssets.get(key);
            if (asset) {
                cc.assetManager.releaseAsset(asset);
                this.loadedAssets.delete(key);
                this.assetRefCount.delete(key);
            }
        });

        if (toRemove.length > 0) {
            cc.log(`[ResourceManager] Cleaned up ${toRemove.length} unused assets`);
        }
    }

    private incrementRefCount(key: string): void {
        const current = this.assetRefCount.get(key) || 0;
        this.assetRefCount.set(key, current + 1);
    }

    private decrementRefCount(key: string): void {
        const current = this.assetRefCount.get(key) || 0;
        this.assetRefCount.set(key, Math.max(0, current - 1));
    }

    private getRefCount(key: string): number {
        return this.assetRefCount.get(key) || 0;
    }

    private checkCacheSize(): void {
        if (this.loadedAssets.size > this.maxCacheSize) {
            cc.warn(`[ResourceManager] Cache size exceeded ${this.maxCacheSize}, consider cleanup`);
            this.cleanup();
        }
    }

    private estimateMemoryUsage(): number {
        let totalSize = 0;
        this.loadedAssets.forEach(asset => {
            if (asset instanceof cc.Texture2D) {
                totalSize += asset.width * asset.height * 4; // 假設RGBA格式
            } else if (asset instanceof cc.AudioClip) {
                // 音頻大小估算
                totalSize += 1024; // 簡化估算
            }
        });
        return totalSize;
    }
} 
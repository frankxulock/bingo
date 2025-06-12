/**
 * 視頻優化工具
 * 針對 LCP 問題的視頻資源優化
 */
export class VideoOptimizer {
    private static instance: VideoOptimizer = null;
    private videoCache: Map<string, HTMLVideoElement> = new Map();
    private loadingQueue: Array<{url: string, priority: number}> = [];
    private isProcessingQueue: boolean = false;

    public static getInstance(): VideoOptimizer {
        if (!this.instance) {
            this.instance = new VideoOptimizer();
        }
        return this.instance;
    }

    /**
     * 預加載關鍵視頻（首屏必需）
     */
    public async preloadCriticalVideo(videoUrl: string): Promise<HTMLVideoElement> {
        cc.log(`[VideoOptimizer] Preloading critical video: ${videoUrl}`);
        
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            
            // 優化視頻屬性
            video.preload = 'metadata'; // 只預加載元數據，不是完整視頻
            video.muted = true;
            video.playsInline = true;
            video.crossOrigin = 'anonymous';
            
            // 設置多個格式源
            const sources = this.getOptimizedVideoSources(videoUrl);
            sources.forEach(source => {
                const sourceElement = document.createElement('source');
                sourceElement.src = source.url;
                sourceElement.type = source.type;
                video.appendChild(sourceElement);
            });

            video.addEventListener('loadedmetadata', () => {
                this.videoCache.set(videoUrl, video);
                cc.log(`[VideoOptimizer] Critical video metadata loaded: ${videoUrl}`);
                resolve(video);
            }, { once: true });

            video.addEventListener('error', (error) => {
                cc.error(`[VideoOptimizer] Failed to load critical video: ${videoUrl}`, error);
                reject(error);
            }, { once: true });

            // 開始加載
            video.load();
        });
    }

    /**
     * 漸進式視頻加載
     */
    public async loadVideoProgressively(videoUrl: string, priority: number = 1): Promise<HTMLVideoElement> {
        // 檢查緩存
        if (this.videoCache.has(videoUrl)) {
            return this.videoCache.get(videoUrl);
        }

        // 加入隊列
        this.loadingQueue.push({ url: videoUrl, priority });
        this.loadingQueue.sort((a, b) => b.priority - a.priority); // 高優先級先處理

        if (!this.isProcessingQueue) {
            this.processLoadingQueue();
        }

        // 等待加載完成
        return new Promise((resolve, reject) => {
            const checkLoaded = () => {
                if (this.videoCache.has(videoUrl)) {
                    resolve(this.videoCache.get(videoUrl));
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            checkLoaded();
        });
    }

    /**
     * 獲取優化的視頻源
     */
    private getOptimizedVideoSources(videoUrl: string): Array<{url: string, type: string}> {
        const baseUrl = videoUrl.replace(/\.[^/.]+$/, ''); // 移除副檔名
        
        return [
            { url: `${baseUrl}.webm`, type: 'video/webm' },  // 最佳壓縮比
            { url: `${baseUrl}.mp4`, type: 'video/mp4' },    // 廣泛支持
            { url: videoUrl, type: 'video/mp4' }             // 原始備用
        ];
    }

    /**
     * 處理加載隊列
     */
    private async processLoadingQueue(): Promise<void> {
        if (this.isProcessingQueue || this.loadingQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.loadingQueue.length > 0) {
            const { url } = this.loadingQueue.shift();
            
            if (!this.videoCache.has(url)) {
                try {
                    await this.loadSingleVideo(url);
                } catch (error) {
                    cc.warn(`[VideoOptimizer] Failed to load video: ${url}`, error);
                }
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * 加載單個視頻
     */
    private async loadSingleVideo(videoUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            
            video.preload = 'none'; // 延遲加載
            video.muted = true;
            video.playsInline = true;
            
            const sources = this.getOptimizedVideoSources(videoUrl);
            sources.forEach(source => {
                const sourceElement = document.createElement('source');
                sourceElement.src = source.url;
                sourceElement.type = source.type;
                video.appendChild(sourceElement);
            });

            video.addEventListener('canplaythrough', () => {
                this.videoCache.set(videoUrl, video);
                resolve();
            }, { once: true });

            video.addEventListener('error', reject, { once: true });
            
            video.load();
        });
    }

    /**
     * 創建視頻佔位符（減少 LCP 時間）
     */
    public createVideoPlaceholder(width: number, height: number, posterUrl?: string): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        if (posterUrl) {
            // 加載海報圖片作為佔位符
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
            };
            img.src = posterUrl;
        } else {
            // 創建簡單的漸變佔位符
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#2a2a2a');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            // 添加播放圖標
            this.drawPlayIcon(ctx, width / 2, height / 2, Math.min(width, height) * 0.1);
        }
        
        return canvas;
    }

    /**
     * 繪製播放圖標
     */
    private drawPlayIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(x - size * 0.5, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x - size * 0.5, y + size);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * 優化視頻播放設定
     */
    public optimizeVideoPlayback(video: HTMLVideoElement): void {
        // 設置最佳播放屬性
        video.muted = true;
        video.playsInline = true;
        video.autoplay = false; // 避免自動播放影響性能
        
        // 添加播放優化
        video.addEventListener('loadstart', () => {
            cc.log('[VideoOptimizer] Video loading started');
        });
        
        video.addEventListener('canplay', () => {
            cc.log('[VideoOptimizer] Video can start playing');
        });
        
        video.addEventListener('waiting', () => {
            cc.warn('[VideoOptimizer] Video buffering...');
        });
    }

    /**
     * 獲取視頻統計
     */
    public getVideoStats(): any {
        return {
            cachedVideos: this.videoCache.size,
            queuedVideos: this.loadingQueue.length,
            isProcessing: this.isProcessingQueue
        };
    }

    /**
     * 清理視頻緩存
     */
    public cleanup(): void {
        this.videoCache.forEach(video => {
            video.pause();
            video.src = '';
            video.load();
        });
        this.videoCache.clear();
        this.loadingQueue = [];
        this.isProcessingQueue = false;
    }
} 
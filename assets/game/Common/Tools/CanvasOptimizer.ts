import { PerformanceMonitor } from "./PerformanceMonitor";

/**
 * Canvas 優化工具
 * 針對 INP (Interaction to Next Paint) 優化
 */
export class CanvasOptimizer {
    private static instance: CanvasOptimizer = null;
    private performanceMonitor: PerformanceMonitor = null;
    private interactionQueue: Array<() => void> = [];
    private isProcessingInteractions: boolean = false;
    private frameRequestId: number = null;

    public static getInstance(): CanvasOptimizer {
        if (!this.instance) {
            this.instance = new CanvasOptimizer();
        }
        return this.instance;
    }

    constructor() {
        this.performanceMonitor = PerformanceMonitor.getInstance();
    }

    /**
     * 優化 Canvas 事件處理
     */
    public optimizeCanvasEvents(canvas: HTMLCanvasElement): void {
        // 使用被動事件監聽器
        const options = { passive: true };
        
        // 移除舊的事件監聽器（如果存在）
        this.removeCanvasEvents(canvas);
        
        // 添加優化的事件監聽器
        canvas.addEventListener('touchstart', this.createOptimizedHandler('touchstart'), options);
        canvas.addEventListener('touchmove', this.createOptimizedHandler('touchmove'), options);
        canvas.addEventListener('touchend', this.createOptimizedHandler('touchend'), options);
        canvas.addEventListener('mousedown', this.createOptimizedHandler('mousedown'), options);
        canvas.addEventListener('mousemove', this.createOptimizedHandler('mousemove'), options);
        canvas.addEventListener('mouseup', this.createOptimizedHandler('mouseup'), options);
        canvas.addEventListener('click', this.createOptimizedHandler('click'), options);
        
        cc.log('[CanvasOptimizer] Canvas events optimized');
    }

    /**
     * 創建優化的事件處理器
     */
    private createOptimizedHandler(eventType: string): (event: Event) => void {
        return (event: Event) => {
            this.performanceMonitor.startTiming(`canvas-${eventType}`);
            
            // 將處理邏輯加入隊列，避免阻塞主線程
            this.queueInteraction(() => {
                this.handleCanvasInteraction(eventType, event);
                this.performanceMonitor.endTiming(`canvas-${eventType}`);
            });
        };
    }

    /**
     * 將交互加入隊列處理
     */
    private queueInteraction(interaction: () => void): void {
        this.interactionQueue.push(interaction);
        
        if (!this.isProcessingInteractions) {
            this.processInteractionQueue();
        }
    }

    /**
     * 處理交互隊列
     */
    private processInteractionQueue(): void {
        if (this.isProcessingInteractions || this.interactionQueue.length === 0) {
            return;
        }

        this.isProcessingInteractions = true;

        // 使用 requestAnimationFrame 確保在下一幀處理
        this.frameRequestId = requestAnimationFrame(() => {
            const batchSize = Math.min(5, this.interactionQueue.length); // 批量處理，避免阻塞
            
            for (let i = 0; i < batchSize; i++) {
                const interaction = this.interactionQueue.shift();
                if (interaction) {
                    try {
                        interaction();
                    } catch (error) {
                        cc.error('[CanvasOptimizer] Error processing interaction:', error);
                    }
                }
            }

            this.isProcessingInteractions = false;
            
            // 如果還有待處理的交互，繼續處理
            if (this.interactionQueue.length > 0) {
                this.processInteractionQueue();
            }
        });
    }

    /**
     * 處理 Canvas 交互
     */
    private handleCanvasInteraction(eventType: string, event: Event): void {
        // 這裡可以添加具體的交互處理邏輯
        // 目前只記錄性能指標
        
        // const interactionData = {
        //     type: eventType,
        //     timestamp: Date.now(),
        //     target: (event.target as HTMLElement)?.tagName || 'unknown'
        // };

        // // 記錄交互延遲
        // if (event.timeStamp) {
        //     const delay = Date.now() - event.timeStamp;
        //     this.performanceMonitor.recordMetric(`interaction-delay-${eventType}`, delay);
        // }

        // cc.log(`[CanvasOptimizer] Processed ${eventType} interaction:`, interactionData);
    }

    /**
     * 優化 Canvas 渲染性能
     */
    public optimizeCanvasRendering(canvas: HTMLCanvasElement): void {
        // 設置硬體加速
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // 啟用 imageSmoothingEnabled 優化
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }

        // 設置 Canvas 屬性
        canvas.style.willChange = 'transform'; // 提示瀏覽器該元素會變化
        canvas.style.transform = 'translateZ(0)'; // 強制硬體加速
        
        // 優化 Canvas 大小設定
        this.optimizeCanvasSize(canvas);
        
        cc.log('[CanvasOptimizer] Canvas rendering optimized');
    }

    /**
     * 優化 Canvas 尺寸
     */
    private optimizeCanvasSize(canvas: HTMLCanvasElement): void {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        // 設置實際像素大小
        canvas.width = rect.width * devicePixelRatio;
        canvas.height = rect.height * devicePixelRatio;
        
        // 設置顯示大小
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        // 縮放 context 以匹配設備像素比
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(devicePixelRatio, devicePixelRatio);
        }
    }

    /**
     * 移除 Canvas 事件監聽器
     */
    private removeCanvasEvents(canvas: HTMLCanvasElement): void {
        // 這裡可以添加移除事件監聽器的邏輯
        // 由於我們使用匿名函數，實際項目中建議保存引用以便移除
    }

    /**
     * 創建節流的交互處理器
     */
    public createThrottledInteractionHandler(
        handler: (event: Event) => void,
        delay: number = 16 // 約 60fps
    ): (event: Event) => void {
        let lastCall = 0;
        let timeoutId: number = null;

        return (event: Event) => {
            const now = Date.now();
            
            if (now - lastCall >= delay) {
                lastCall = now;
                handler(event);
            } else {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                
                timeoutId = setTimeout(() => {
                    lastCall = Date.now();
                    handler(event);
                }, delay - (now - lastCall));
            }
        };
    }

    /**
     * 創建防抖的交互處理器
     */
    public createDebouncedInteractionHandler(
        handler: (event: Event) => void,
        delay: number = 100
    ): (event: Event) => void {
        let timeoutId: number = null;

        return (event: Event) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            timeoutId = setTimeout(() => {
                handler(event);
            }, delay);
        };
    }

    /**
     * 監控 Canvas 性能
     */
    public monitorCanvasPerformance(canvas: HTMLCanvasElement): void {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            
            entries.forEach(entry => {
                if (entry.entryType === 'measure' && entry.name.includes('canvas')) {
                    this.performanceMonitor.recordMetric(entry.name, entry.duration);
                }
            });
        });

        // 監控各種性能指標
        try {
            observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
        } catch (error) {
            cc.warn('[CanvasOptimizer] Performance observer not supported:', error);
        }
    }

    /**
     * 獲取交互統計
     */
    public getInteractionStats(): any {
        return {
            queueLength: this.interactionQueue.length,
            isProcessing: this.isProcessingInteractions,
            averageDelay: {
                touchstart: this.performanceMonitor.getAverageMetric('interaction-delay-touchstart'),
                click: this.performanceMonitor.getAverageMetric('interaction-delay-click'),
                mousedown: this.performanceMonitor.getAverageMetric('interaction-delay-mousedown')
            }
        };
    }

    /**
     * 清理資源
     */
    public cleanup(): void {
        if (this.frameRequestId) {
            cancelAnimationFrame(this.frameRequestId);
            this.frameRequestId = null;
        }
        
        this.interactionQueue = [];
        this.isProcessingInteractions = false;
        
        cc.log('[CanvasOptimizer] Cleanup completed');
    }
} 
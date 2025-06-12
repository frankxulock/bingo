/**
 * 性能監控工具
 * 監控遊戲的FPS、內存使用、網路請求等性能指標
 */
export class PerformanceMonitor {
    private static instance: PerformanceMonitor = null;
    private metrics: Map<string, number[]> = new Map();
    private frameCount: number = 0;
    private fpsHistory: number[] = [];
    private memoryHistory: number[] = [];
    private lastFrameTime: number = 0;
    private monitoringEnabled: boolean = false;
    private updateInterval: number = null;

    public static getInstance(): PerformanceMonitor {
        if (!this.instance) {
            this.instance = new PerformanceMonitor();
        }
        return this.instance;
    }

    /**
     * 開始監控
     */
    public startMonitoring(): void {
        if (this.monitoringEnabled) return;

        this.monitoringEnabled = true;
        this.lastFrameTime = Date.now();
        
        // 每秒收集一次數據
        this.updateInterval = setInterval(() => {
            this.collectMetrics();
        }, 1000);

        cc.log("[PerformanceMonitor] Monitoring started");
    }

    /**
     * 停止監控
     */
    public stopMonitoring(): void {
        if (!this.monitoringEnabled) return;

        this.monitoringEnabled = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        cc.log("[PerformanceMonitor] Monitoring stopped");
    }

    /**
     * 開始計時
     */
    public startTiming(label: string): void {
        if (!performance.mark) return;
        performance.mark(`${label}-start`);
    }

    /**
     * 結束計時
     */
    public endTiming(label: string): number {
        if (!performance.mark || !performance.measure) return 0;

        try {
            performance.mark(`${label}-end`);
            performance.measure(label, `${label}-start`, `${label}-end`);
            
            const entries = performance.getEntriesByName(label);
            if (entries.length > 0) {
                const duration = entries[entries.length - 1].duration;
                this.recordMetric(label, duration);
                return duration;
            }
        } catch (e) {
            cc.warn(`[PerformanceMonitor] Failed to measure ${label}:`, e);
        }
        
        return 0;
    }

    /**
     * 記錄自定義指標
     */
    public recordMetric(name: string, value: number): void {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        
        const values = this.metrics.get(name);
        values.push(value);
        
        // 只保留最近100個數據點
        if (values.length > 100) {
            values.shift();
        }
    }

    /**
     * 收集系統指標
     */
    private collectMetrics(): void {
        if (!this.monitoringEnabled) return;

        // FPS 計算
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        const fps = deltaTime > 0 ? 1000 / deltaTime : 0;
        
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > 60) { // 保留最近60秒
            this.fpsHistory.shift();
        }

        // 內存使用（如果可用）
        if (window.performance && (window.performance as any).memory) {
            const memory = (window.performance as any).memory;
            const memoryMB = memory.usedJSHeapSize / 1024 / 1024;
            this.memoryHistory.push(memoryMB);
            
            if (this.memoryHistory.length > 60) {
                this.memoryHistory.shift();
            }
        }

        this.lastFrameTime = currentTime;
        this.frameCount++;
    }

    /**
     * 獲取平均值
     */
    public getAverageMetric(name: string): number {
        const values = this.metrics.get(name);
        if (!values || values.length === 0) return 0;
        
        return values.reduce((a, b) => a + b) / values.length;
    }

    /**
     * 獲取最大值
     */
    public getMaxMetric(name: string): number {
        const values = this.metrics.get(name);
        if (!values || values.length === 0) return 0;
        
        return Math.max(...values);
    }

    /**
     * 獲取最小值
     */
    public getMinMetric(name: string): number {
        const values = this.metrics.get(name);
        if (!values || values.length === 0) return 0;
        
        return Math.min(...values);
    }

    /**
     * 獲取當前FPS
     */
    public getCurrentFPS(): number {
        return this.fpsHistory.length > 0 ? this.fpsHistory[this.fpsHistory.length - 1] : 0;
    }

    /**
     * 獲取平均FPS
     */
    public getAverageFPS(): number {
        if (this.fpsHistory.length === 0) return 0;
        return this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;
    }

    /**
     * 獲取當前內存使用
     */
    public getCurrentMemory(): number {
        return this.memoryHistory.length > 0 ? this.memoryHistory[this.memoryHistory.length - 1] : 0;
    }

    /**
     * 獲取性能報告
     */
    public getPerformanceReport(): any {
        const report = {
            fps: {
                current: this.getCurrentFPS(),
                average: this.getAverageFPS(),
                min: this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0,
                max: this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory) : 0
            },
            memory: {
                current: this.getCurrentMemory(),
                average: this.memoryHistory.length > 0 ? 
                    this.memoryHistory.reduce((a, b) => a + b) / this.memoryHistory.length : 0,
                peak: this.memoryHistory.length > 0 ? Math.max(...this.memoryHistory) : 0
            },
            metrics: {} as any,
            frameCount: this.frameCount
        };

        // 添加自定義指標
        this.metrics.forEach((values, name) => {
            report.metrics[name] = {
                average: this.getAverageMetric(name),
                min: this.getMinMetric(name),
                max: this.getMaxMetric(name),
                count: values.length
            };
        });

        return report;
    }

    /**
     * 輸出性能報告到控制台
     */
    public logPerformanceReport(): void {
        const report = this.getPerformanceReport();
        
        console.group("🔍 Performance Report");
        console.log("📊 FPS:", report.fps);
        console.log("💾 Memory (MB):", report.memory);
        console.log("📈 Custom Metrics:", report.metrics);
        console.log("🎬 Frame Count:", report.frameCount);
        console.groupEnd();
    }

    /**
     * 檢查性能警告
     */
    public checkPerformanceWarnings(): string[] {
        const warnings: string[] = [];
        const avgFPS = this.getAverageFPS();
        const currentMemory = this.getCurrentMemory();

        if (avgFPS > 0 && avgFPS < 30) {
            warnings.push(`Low FPS detected: ${avgFPS.toFixed(1)} fps`);
        }

        if (currentMemory > 100) { // 100MB
            warnings.push(`High memory usage: ${currentMemory.toFixed(1)} MB`);
        }

        // 檢查自定義指標
        this.metrics.forEach((values, name) => {
            const avg = this.getAverageMetric(name);
            if (name.includes('loading') && avg > 3000) { // 3秒
                warnings.push(`Slow ${name}: ${avg.toFixed(1)}ms`);
            }
        });

        return warnings;
    }

    /**
     * 清理數據
     */
    public clear(): void {
        this.metrics.clear();
        this.fpsHistory = [];
        this.memoryHistory = [];
        this.frameCount = 0;
    }
} 
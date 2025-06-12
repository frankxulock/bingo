import { ResourceManager } from "./ResourceManager";
import { PerformanceMonitor } from "./PerformanceMonitor";

/**
 * 優化的音頻管理器
 * 包含音頻池、預加載、記憶體管理等功能
 */
export class AudioOptimized {
    private static instance: AudioOptimized = null;
    private audioPool: Map<string, any[]> = new Map();
    private loadedAudio: Map<string, cc.AudioClip> = new Map();
    private maxPoolSize: number = 3;
    private resourceManager: ResourceManager = null;
    private performanceMonitor: PerformanceMonitor = null;
    private playingAudio: Set<string> = new Set();

    public static getInstance(): AudioOptimized {
        if (!this.instance) {
            this.instance = new AudioOptimized();
        }
        return this.instance;
    }

    constructor() {
        this.resourceManager = ResourceManager.getInstance();
        this.performanceMonitor = PerformanceMonitor.getInstance();
    }

    /**
     * 預加載音頻資源
     */
    public async preloadAudio(audioList: string[]): Promise<void> {
        this.performanceMonitor.startTiming('AudioPreload');
        
        try {
            const loadPromises = audioList.map(async (audioPath) => {
                if (this.loadedAudio.has(audioPath)) {
                    return;
                }

                try {
                    const audioClip = await this.resourceManager.loadAsset<cc.AudioClip>(
                        audioPath, 
                        cc.AudioClip
                    );
                    this.loadedAudio.set(audioPath, audioClip);
                    cc.log(`[AudioOptimized] Preloaded: ${audioPath}`);
                } catch (error) {
                    cc.error(`[AudioOptimized] Failed to preload ${audioPath}:`, error);
                }
            });

            await Promise.all(loadPromises);
            cc.log(`[AudioOptimized] Preloaded ${audioList.length} audio files`);
        } finally {
            this.performanceMonitor.endTiming('AudioPreload');
        }
    }

    /**
     * 播放音效（使用對象池）
     */
    public playEffect(audioPath: string, volume: number = 1, loop: boolean = false): number {
        this.performanceMonitor.startTiming('PlayEffect');
        
        try {
            const audioClip = this.loadedAudio.get(audioPath);
            if (!audioClip) {
                cc.warn(`[AudioOptimized] Audio not preloaded: ${audioPath}`);
                // 嘗試即時加載
                this.loadAndPlayEffect(audioPath, volume, loop);
                return -1;
            }

            // 檢查是否已經在播放太多相同音效
            if (this.isEffectPlaying(audioPath) && !loop) {
                return -1; // 避免重複播放相同音效
            }

            const audioId = cc.audioEngine.playEffect(audioClip, loop);
            if (audioId !== -1) {
                cc.audioEngine.setEffectsVolume(volume);
                this.playingAudio.add(`${audioPath}_${audioId}`);
                
                // 播放結束後清理
                this.scheduleCleanup(audioPath, audioId);
            }

            return audioId;
        } finally {
            this.performanceMonitor.endTiming('PlayEffect');
        }
    }

    /**
     * 播放背景音樂
     */
    public playMusic(audioPath: string, volume: number = 1, loop: boolean = true): number {
        this.performanceMonitor.startTiming('PlayMusic');
        
        try {
            const audioClip = this.loadedAudio.get(audioPath);
            if (!audioClip) {
                cc.warn(`[AudioOptimized] Music not preloaded: ${audioPath}`);
                return -1;
            }

            // 停止當前背景音樂
            cc.audioEngine.stopMusic();

            const audioId = cc.audioEngine.playMusic(audioClip, loop);
            if (audioId !== -1) {
                cc.audioEngine.setMusicVolume(volume);
            }

            return audioId;
        } finally {
            this.performanceMonitor.endTiming('PlayMusic');
        }
    }

    /**
     * 即時加載並播放音效
     */
    private async loadAndPlayEffect(audioPath: string, volume: number, loop: boolean): Promise<void> {
        try {
            const audioClip = await this.resourceManager.loadAsset<cc.AudioClip>(
                audioPath, 
                cc.AudioClip
            );
            this.loadedAudio.set(audioPath, audioClip);
            
            const audioId = cc.audioEngine.playEffect(audioClip, loop);
            if (audioId !== -1) {
                cc.audioEngine.setEffectsVolume(volume);
                this.playingAudio.add(`${audioPath}_${audioId}`);
                this.scheduleCleanup(audioPath, audioId);
            }
        } catch (error) {
            cc.error(`[AudioOptimized] Failed to load and play ${audioPath}:`, error);
        }
    }

    /**
     * 檢查音效是否正在播放
     */
    private isEffectPlaying(audioPath: string): boolean {
        const playingArray = Array.from(this.playingAudio);
        return playingArray.some(playingKey => playingKey.startsWith(audioPath));
    }

    /**
     * 安排清理任務
     */
    private scheduleCleanup(audioPath: string, audioId: number): void {
        // 獲取音頻長度來計算清理時間
        const audioClip = this.loadedAudio.get(audioPath);
        if (audioClip && audioClip.duration > 0) {
            setTimeout(() => {
                this.playingAudio.delete(`${audioPath}_${audioId}`);
            }, audioClip.duration * 1000 + 100); // 多加100ms確保播放完成
        } else {
            // 如果無法獲取長度，5秒後清理
            setTimeout(() => {
                this.playingAudio.delete(`${audioPath}_${audioId}`);
            }, 5000);
        }
    }

    /**
     * 停止音效
     */
    public stopEffect(audioId: number): void {
        cc.audioEngine.stopEffect(audioId);
        
        // 從播放列表中移除
        const playingArray = Array.from(this.playingAudio);
        for (const playingKey of playingArray) {
            if (playingKey.endsWith(`_${audioId}`)) {
                this.playingAudio.delete(playingKey);
                break;
            }
        }
    }

    /**
     * 停止所有音效
     */
    public stopAllEffects(): void {
        cc.audioEngine.stopAllEffects();
        this.playingAudio.clear();
    }

    /**
     * 停止背景音樂
     */
    public stopMusic(): void {
        cc.audioEngine.stopMusic();
    }

    /**
     * 暫停所有音頻
     */
    public pauseAll(): void {
        cc.audioEngine.pauseAll();
    }

    /**
     * 恢復所有音頻
     */
    public resumeAll(): void {
        cc.audioEngine.resumeAll();
    }

    /**
     * 設置音效音量
     */
    public setEffectsVolume(volume: number): void {
        cc.audioEngine.setEffectsVolume(volume);
    }

    /**
     * 設置背景音樂音量
     */
    public setMusicVolume(volume: number): void {
        cc.audioEngine.setMusicVolume(volume);
    }

    /**
     * 釋放特定音頻資源
     */
    public releaseAudio(audioPath: string): void {
        if (this.loadedAudio.has(audioPath)) {
            this.resourceManager.releaseAsset(audioPath);
            this.loadedAudio.delete(audioPath);
            
            // 清理相關的播放記錄
            const toRemove: string[] = [];
            const playingArray = Array.from(this.playingAudio);
            playingArray.forEach(playingKey => {
                if (playingKey.startsWith(audioPath)) {
                    toRemove.push(playingKey);
                }
            });
            toRemove.forEach(key => this.playingAudio.delete(key));
            
            cc.log(`[AudioOptimized] Released: ${audioPath}`);
        }
    }

    /**
     * 釋放所有音頻資源
     */
    public releaseAll(): void {
        // 停止所有播放
        this.stopAllEffects();
        this.stopMusic();
        
        // 釋放所有資源
        this.loadedAudio.forEach((_, audioPath) => {
            this.resourceManager.releaseAsset(audioPath);
        });
        
        this.loadedAudio.clear();
        this.playingAudio.clear();
        this.audioPool.clear();
        
        cc.log("[AudioOptimized] Released all audio resources");
    }

    /**
     * 獲取音頻統計信息
     */
    public getAudioStats(): any {
        return {
            loadedCount: this.loadedAudio.size,
            playingCount: this.playingAudio.size,
            poolSize: Array.from(this.audioPool.values()).reduce((total, pool) => total + pool.length, 0),
            performance: {
                avgPreloadTime: this.performanceMonitor.getAverageMetric('AudioPreload'),
                avgPlayTime: this.performanceMonitor.getAverageMetric('PlayEffect')
            }
        };
    }

    /**
     * 清理未使用的音頻資源
     */
    public cleanup(): void {
        const now = Date.now();
        const toRemove: string[] = [];
        
        // 清理長時間未播放的音頻
        this.loadedAudio.forEach((audioClip, audioPath) => {
            if (!this.isEffectPlaying(audioPath)) {
                // 這裡可以加入更複雜的邏輯來決定是否釋放
                // 例如：根據最後播放時間、使用頻率等
            }
        });
        
        // 清理過期的播放記錄
        const playingArray = Array.from(this.playingAudio);
        playingArray.forEach(playingKey => {
            const audioId = parseInt(playingKey.split('_').pop() || '-1');
            if (audioId !== -1 && cc.audioEngine.getState(audioId) === cc.audioEngine.AudioState.STOPPED) {
                this.playingAudio.delete(playingKey);
            }
        });
        
        if (toRemove.length > 0) {
            cc.log(`[AudioOptimized] Cleaned up ${toRemove.length} unused audio resources`);
        }
    }

    /**
     * 批量播放音效（用於連續音效）
     */
    public playEffectSequence(audioList: Array<{path: string, delay?: number, volume?: number}>): void {
        let totalDelay = 0;
        
        audioList.forEach((audioConfig, index) => {
            setTimeout(() => {
                this.playEffect(audioConfig.path, audioConfig.volume || 1, false);
            }, totalDelay);
            
            totalDelay += audioConfig.delay || 500; // 默認500ms間隔
        });
    }

    /**
     * 設置全局音頻設置
     */
    public setGlobalSettings(settings: {
        effectsVolume?: number,
        musicVolume?: number,
        maxConcurrentEffects?: number
    }): void {
        if (settings.effectsVolume !== undefined) {
            this.setEffectsVolume(settings.effectsVolume);
        }
        
        if (settings.musicVolume !== undefined) {
            this.setMusicVolume(settings.musicVolume);
        }
        
        if (settings.maxConcurrentEffects !== undefined) {
            this.maxPoolSize = settings.maxConcurrentEffects;
        }
    }
} 
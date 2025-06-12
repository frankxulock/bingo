import MegaComponent from "../../Common/Base/gameMega/MegaComponent";
import { SocketManager } from "../../Common/Base/SocketManager";
import { audioManager } from "../../Common/Tools/AudioMgr";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../Common/Tools/Base/EventManager";
import { PopupName } from "../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../Common/Tools/PopupSystem/PopupManager";
import { UrlManager } from "../../Common/Tools/UrlManager";
import { ResourceManager } from "../../Common/Tools/ResourceManager";
import { PerformanceMonitor } from "../../Common/Tools/PerformanceMonitor";
import { VideoOptimizer } from "../../Common/Tools/VideoOptimizer";
import { CanvasOptimizer } from "../../Common/Tools/CanvasOptimizer";

/*** 與其他操作系統處理處 */
const {ccclass, property} = cc._decorator;
@ccclass
export default class BingoMegaH5 extends MegaComponent {

    private initialized : boolean = false;
    private initStart: boolean = false;
    private resourceManager: ResourceManager = null;
    private performanceMonitor: PerformanceMonitor = null;
    private videoOptimizer: VideoOptimizer = null;
    private canvasOptimizer: CanvasOptimizer = null;
    private cleanupInterval: number = null;

    @property({ type: cc.Node, visible: true })
    private NewGame : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private ExtraTime : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private BingoTime : cc.Node = null;

    /** 監聽事件（後期根據不同遊戲複寫） */
    protected addEventListener() {
        super.addEventListener();
        cc.game.on(cc.game.EVENT_SHOW, () => { 
            audioManager.setHtmlFocus(true);
            this.onGameResume();
        }, this);
        cc.game.on(cc.game.EVENT_HIDE, () => { 
            audioManager.setHtmlFocus(false);
            this.onGamePause();
        }, this);
        EventManager.getInstance().on(GameStateEvent.GAME_BUY, this.onNewGame, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_ExtralTime, this.onExtraTime, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_BingoTime, this.onBingoTime, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_OpenDIYEditPage, this.OpneDIYEditPage, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_DIYConfirmPurchase, this.DIYConfirmPurchase, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SaveDIYCards, this.SaveDIYCards, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_DeleteDIYCard, this.DeleteDIYCard, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendChatMessage, this.SendChat, this);
        cc.director.getScene().on("Game:InitData", this.onReceiveInitData, this);
    }

    /** 監聽事件註銷（後期根據不同遊戲複寫） */
    protected removeEventListener() {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateEvent.GAME_BUY, this.onNewGame, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_ExtralTime, this.onExtraTime, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_BingoTime, this.onBingoTime, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_OpenDIYEditPage, this.OpneDIYEditPage, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_DIYConfirmPurchase, this.DIYConfirmPurchase, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SaveDIYCards, this.SaveDIYCards, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_DeleteDIYCard, this.DeleteDIYCard, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SendChatMessage, this.SendChat, this);
    }

    /** 初始化各種註冊流程（後期根據不同遊戲複寫） */
    protected init(): void {
        super.init();
        
        // 初始化資源管理器
        this.resourceManager = ResourceManager.getInstance();
        
        // 初始化性能監控
        this.performanceMonitor = PerformanceMonitor.getInstance();
        this.performanceMonitor.startMonitoring();
        
        // 初始化視頻優化器
        this.videoOptimizer = VideoOptimizer.getInstance();
        
        // 初始化Canvas優化器
        this.canvasOptimizer = CanvasOptimizer.getInstance();
        
        // 音頻初始化
        audioManager.init({bgmVolume : 1, soundVolume : 1});
        audioManager.setNode();
        
        // 設定定期清理任務（每30秒執行一次）
        this.setupCleanupInterval();
        
        // 優化 Canvas 性能
        this.optimizeCanvasPerformance();
        
        cc.log("[BingoMegaH5] All optimization systems initialized");
    }

    protected start(): void {
        this.initStart = true;
        this.onReceiveInitData();
    }

    onNewGame() {
        // 頁面在前台（可見）
        if (document.visibilityState === "visible")
            this.NewGame.active = true;
    }

    onExtraTime() {
        // 頁面在前台（可見）
        if (document.visibilityState === "visible")
            this.ExtraTime.active = true;
    }

    onBingoTime() {
        // 頁面在前台（可見）
        if (document.visibilityState === "visible")
            this.BingoTime.active = true;
    }

    private onReceiveInitData() {
        // 避免初始化執行兩次 快照更新
        if (!this.initialized && this.initStart && (window.serverData && Object.keys(window.serverData).length > 0)) {
            this.performanceMonitor.startTiming('InitData');
            
            this.data.init();
            const socket = SocketManager.getInstance();
            socket.connect(window.url.WSHOST);
            this.initialized = true;
            
            this.performanceMonitor.endTiming('InitData');
        }
    }

    /** 開啟DIY編輯頁面 */
    private OpneDIYEditPage(data) {
        this.data.OpenDIYEditCard(data);
    }

    /** DIY選購卡片完畢事件 */
    private DIYConfirmPurchase(data) {
        this.data.DIYConfirmPurchase(data);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_CardPurchasePage);
    }

    /** 儲存玩家編輯完畢的DIY卡片資訊 */
    private SaveDIYCards(data) {
        // console.log("儲存DIY卡片  可能需要Server請求參數等等事件先保留")
        this.data.DIYCardEditUpdate(data);
        this.data.SendDIYCardSelectionPage(false);
    }

    /** DIY刪除卡片事件 */
    private DeleteDIYCard(data) {
        this.data.DIYDelete(data);
        this.data.SendDIYCardSelectionPage(false);
    }

    /** 發送聊天訊息 */
    private SendChat(message : string) {
        let newMessage = this.data.SendChat(message);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_ReceiveChatMessage, newMessage);
    }

    /** 遊戲暫停時的處理 */
    private onGamePause(): void {
        // 停止性能監控以節省資源
        this.performanceMonitor.stopMonitoring();
        
        // 清理未使用的資源
        this.resourceManager.cleanup();
        
        // 清理視頻資源
        this.videoOptimizer.cleanup();
        
        cc.log("[BingoMegaH5] Game paused, resources cleaned");
    }

    /** 遊戲恢復時的處理 */
    private onGameResume(): void {
        // 重新啟動性能監控
        this.performanceMonitor.startMonitoring();
        
        // 檢查性能警告
        const warnings = this.performanceMonitor.checkPerformanceWarnings();
        if (warnings.length > 0) {
            cc.warn("[BingoMegaH5] Performance warnings:", warnings);
        }
        
        cc.log("[BingoMegaH5] Game resumed, monitoring restarted");
    }

    /** 優化 Canvas 性能 */
    private optimizeCanvasPerformance(): void {
        // 等待Canvas準備就緒
        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => {
            const canvas = cc.game.canvas;
            if (canvas) {
                // 優化Canvas事件處理
                this.canvasOptimizer.optimizeCanvasEvents(canvas);
                
                // 優化Canvas渲染
                this.canvasOptimizer.optimizeCanvasRendering(canvas);
                
                // 監控Canvas性能
                this.canvasOptimizer.monitorCanvasPerformance(canvas);
                
                cc.log("[BingoMegaH5] Canvas performance optimized");
            }
        });
    }

    /** 預加載關鍵視頻資源 */
    public async preloadCriticalVideos(videoUrls: string[]): Promise<void> {
        this.performanceMonitor.startTiming('VideoPreload');
        
        try {
            const preloadPromises = videoUrls.map(url => 
                this.videoOptimizer.preloadCriticalVideo(url)
            );
            
            await Promise.all(preloadPromises);
            cc.log(`[BingoMegaH5] Preloaded ${videoUrls.length} critical videos`);
        } catch (error) {
            cc.error("[BingoMegaH5] Failed to preload critical videos:", error);
        } finally {
            this.performanceMonitor.endTiming('VideoPreload');
        }
    }

    /** 設定定期清理任務 */
    private setupCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, 30000); // 30秒執行一次
    }

    /** 執行清理任務 */
    private performCleanup(): void {
        // 清理資源管理器中未使用的資源
        this.resourceManager.cleanup();
        
        // 清理Canvas優化器
        if (this.canvasOptimizer) {
            // Canvas優化器的清理會在組件銷毀時執行
        }
        
        // 檢查性能警告
        const warnings = this.performanceMonitor.checkPerformanceWarnings();
        if (warnings.length > 0) {
            cc.warn("[BingoMegaH5] Performance warnings detected:", warnings);
        }
        
        // 輸出性能統計（只在開發模式）
        if (CC_DEBUG) {
            this.performanceMonitor.logPerformanceReport();
            const resourceStats = this.resourceManager.getCacheStats();
            const videoStats = this.videoOptimizer.getVideoStats();
            const canvasStats = this.canvasOptimizer.getInteractionStats();
            
            console.group("🔍 Optimization Stats");
            console.log("📦 Resource cache:", resourceStats);
            console.log("🎬 Video cache:", videoStats);
            console.log("🖱️ Canvas interactions:", canvasStats);
            console.groupEnd();
        }
    }

    /** 獲取優化統計資訊 */
    public getOptimizationStats(): any {
        return {
            performance: this.performanceMonitor.getPerformanceReport(),
            resources: this.resourceManager.getCacheStats(),
            videos: this.videoOptimizer.getVideoStats(),
            canvas: this.canvasOptimizer.getInteractionStats(),
            timestamp: Date.now()
        };
    }

    /** 組件銷毀時清理 */
    protected onDestroy(): void {
        super.onDestroy();
        
        // 停止性能監控
        if (this.performanceMonitor) {
            this.performanceMonitor.stopMonitoring();
        }
        
        // 清理定時器
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // 釋放所有資源
        if (this.resourceManager) {
            this.resourceManager.releaseAll();
        }
        
        // 清理視頻資源
        if (this.videoOptimizer) {
            this.videoOptimizer.cleanup();
        }
        
        // 清理Canvas優化器
        if (this.canvasOptimizer) {
            this.canvasOptimizer.cleanup();
        }
        
        cc.log("[BingoMegaH5] Complete cleanup completed on destroy");
    }
}

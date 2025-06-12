/**
 * 🏭 PrefabManager - Prefab預加載和節點池管理器
 * 
 * 職責：
 * 1. 在OnGameSnapshot時自動預加載所有popup prefab
 * 2. 將prefab實例化為節點並存放在隱藏容器中
 * 3. 提供節點借出/歸還功能給PopupManager
 * 4. 節點一直存在場景中，不會被銷毀
 */

import BaseSingletonComponent from "../Base/BaseSingletonComponent";
import EventManager, { GameStateEvent } from "../Base/EventManager";
import { PopupName, PopupPrefabPath } from "./PopupConfig";

const { ccclass, property } = cc._decorator;

/**
 * PrefabManager - 弹窗Prefab管理器
 * 
 * 使用示例：
 * 
 * // 1. 进入房间后启动全部预加载
 * PrefabManager.getInstance().preloadAllPrefabs(
 *     (loaded, total, current) => {
 *         console.log(`预加载进度: ${loaded}/${total} - 当前: ${current}`);
 *         // 可以在这里更新加载进度UI
 *     },
 *     (success, failed, failedList) => {
 *         console.log(`预加载完成: 成功${success}个, 失败${failed}个`);
 *         if (failed > 0) {
 *             console.warn('失败的prefab:', failedList);
 *         }
 *     },
 *     2 // 并发数量，手机上建议设为2-3，避免性能压力
 * );
 * 
 * // 2. 只预加载常用的弹窗
 * const commonPopups: PopupName[] = [
 *     PopupName.ResultPage,
 *     PopupName.RewardPopupPage,
 *     PopupName.ConfirmPurchasePage,
 *     PopupName.HelpCenterPage
 * ];
 * PrefabManager.getInstance().preloadSpecificPrefabs(commonPopups);
 * 
 * // 3. 检查预加载状态
 * const status = PrefabManager.getInstance().getPreloadStatus();
 * if (status.isComplete) {
 *     console.log('预加载已完成');
 * }
 * 
 * // 4. 清理内存（场景切换时）
 * PrefabManager.getInstance().clearAllPrefabs();
 */

export interface PreloadProgressCallback {
    (loadedCount: number, totalCount: number, currentPrefab: string): void;
}

export interface PreloadCompleteCallback {
    (successCount: number, failedCount: number, failedPrefabs: string[]): void;
}

@ccclass
export default class PrefabManager extends BaseSingletonComponent {
    public static instance: PrefabManager = null;

    @property({
        displayName: "啟用自動預加載",
        tooltip: "是否在GameSnapshot時自動預加載"
    })
    public enableAutoPreload: boolean = true;

    @property({
        displayName: "隱藏容器節點",
        tooltip: "用於存放預實例化的popup節點"
    })
    @property(cc.Node)
    public hiddenContainer: cc.Node = null;

    // Prefab緩存
    private prefabMap: Map<string, cc.Prefab> = new Map();
    
    // 節點池：每個popup對應一個預實例化的節點
    private nodePool: Map<string, cc.Node> = new Map();
    
    // 當前被借出的節點
    private borrowedNodes: Map<string, cc.Node> = new Map();
    
    // 預加載狀態
    private isPreloading: boolean = false;
    private preloadComplete: boolean = false;
    
    // 最大同時加載數量
    private readonly MAX_CONCURRENT = 2;

    public static getInstance(): PrefabManager {
        return this._getInstance(PrefabManager);
    }

    protected onLoad(): void {
        super.onLoad();
        this.initializeHiddenContainer();
        this.registerEventListeners();
    }

    protected onDestroy(): void {
        this.unregisterEventListeners();
        super.onDestroy();
    }

    /**
     * 初始化隱藏容器節點
     */
    private initializeHiddenContainer(): void {
        if (!this.hiddenContainer) {
            this.hiddenContainer = new cc.Node("HiddenPopupContainer");
            this.node.addChild(this.hiddenContainer);
        }
        
        // 隱藏容器，節點不會被渲染但仍然存在
        this.hiddenContainer.active = false;
    }

    /**
     * 註冊事件監聽
     */
    private registerEventListeners(): void {
        if (this.enableAutoPreload) {
            EventManager.getInstance().on(GameStateEvent.GAME_SNAPSHOT, this.startPreload, this);
        }
    }

    /**
     * 取消事件監聽
     */
    private unregisterEventListeners(): void {
        EventManager.getInstance().off(GameStateEvent.GAME_SNAPSHOT, this.startPreload, this);
    }

    /**
     * 🚀 開始預加載流程
     */
    private async startPreload(): Promise<void> {
        if (this.isPreloading || this.preloadComplete) {
            return;
        }

        this.isPreloading = true;
        const startTime = Date.now();

        try {
            // 獲取所有popup名稱
            const allPopupNames = Object.values(PopupName) as PopupName[];
            let successCount = 0;
            let failedCount = 0;

            // 分批加載，控制並發數量
            for (let i = 0; i < allPopupNames.length; i += this.MAX_CONCURRENT) {
                const batch = allPopupNames.slice(i, i + this.MAX_CONCURRENT);
                
                const promises = batch.map(async (popupName) => {
                    try {
                        await this.preloadPopupNode(popupName);
                        successCount++;
                    } catch (error) {
                        failedCount++;
                        cc.error(`[PrefabManager] 預加載失敗: ${popupName}`, error);
                    }
                });

                // 等待當前批次完成
                await Promise.all(promises);
                
                // 給主線程一些時間
                await new Promise(resolve => this.scheduleOnce(resolve, 0.01));
            }

            this.preloadComplete = true;
        } catch (error) {
            cc.error("[PrefabManager] 預加載過程中發生錯誤:", error);
        } finally {
            this.isPreloading = false;
        }
    }

    /**
     * 🔧 預加載單個popup的prefab和節點
     */
    private async preloadPopupNode(popupName: PopupName): Promise<void> {
        // 如果已經預加載過，跳過
        if (this.nodePool.has(popupName)) {
            return;
        }

        // 1. 載入prefab
        const path = PopupPrefabPath[popupName];
        if (!path) {
            throw new Error(`找不到 ${popupName} 的 prefab 路徑`);
        }

        let prefab = this.prefabMap.get(popupName);
        if (!prefab) {
            prefab = await this.loadPrefabAsync(path);
            this.prefabMap.set(popupName, prefab);
        }

        // 2. 實例化節點
        const node = cc.instantiate(prefab);
        node.name = popupName;
        
        // 3. 放入隱藏容器
        this.hiddenContainer.addChild(node);
        node.active = false;

        // 4. 存入節點池
        this.nodePool.set(popupName, node);
    }

    /**
     * 🎯 借出節點給PopupManager使用
     */
    public borrowNode(popupName: PopupName): cc.Node | null {
        // 檢查是否已經被借出
        if (this.borrowedNodes.has(popupName)) {
            cc.warn(`[PrefabManager] ${popupName} 節點已被借出，不能重複借出`);
            return null;
        }

        // 從節點池獲取節點
        const node = this.nodePool.get(popupName);
        if (!node || !node.isValid) {
            cc.error(`[PrefabManager] ${popupName} 節點不存在或已無效`);
            return null;
        }

        // 標記為已借出
        this.borrowedNodes.set(popupName, node);
        
        // 重置節點狀態
        this.resetNodeState(node);
        return node;
    }

    /**
     * 🔄 歸還節點回PrefabManager
     */
    public returnNode(popupName: PopupName): void {
        const node = this.borrowedNodes.get(popupName);
        if (!node || !node.isValid) {
            cc.warn(`[PrefabManager] ${popupName} 節點未被借出或已無效`);
            return;
        }

        // 重置節點狀態並放回隱藏容器
        this.resetNodeForReturn(node);
        node.parent = this.hiddenContainer;
        node.active = false;

        // 從借出列表中移除
        this.borrowedNodes.delete(popupName);
    }

    /**
     * 檢查節點是否可用
     */
    public isNodeAvailable(popupName: PopupName): boolean {
        return this.nodePool.has(popupName) && !this.borrowedNodes.has(popupName);
    }

    /**
     * 檢查節點是否已被借出
     */
    public isNodeBorrowed(popupName: PopupName): boolean {
        return this.borrowedNodes.has(popupName);
    }

    /**
     * 獲取預加載狀態
     */
    public getPreloadStatus(): {
        isPreloading: boolean;
        isComplete: boolean;
        totalNodes: number;
        availableNodes: number;
        borrowedNodes: number;
    } {
        return {
            isPreloading: this.isPreloading,
            isComplete: this.preloadComplete,
            totalNodes: this.nodePool.size,
            availableNodes: this.nodePool.size - this.borrowedNodes.size,
            borrowedNodes: this.borrowedNodes.size
        };
    }

    /**
     * 手動預加載指定popup（如果自動預加載失敗或需要補充）
     */
    public async manualPreloadPopup(popupName: PopupName): Promise<boolean> {
        try {
            await this.preloadPopupNode(popupName);
            return true;
        } catch (error) {
            cc.error(`[PrefabManager] 手動預加載失敗: ${popupName}`, error);
            return false;
        }
    }

    /**
     * 重置節點狀態（借出時）
     */
    private resetNodeState(node: cc.Node): void {
        node.active = true;
        node.opacity = 255;
        node.scale = 1;
        node.position = cc.Vec3.ZERO;
        node.angle = 0;
        
        // 停止所有動作
        node.stopAllActions();
    }

    /**
     * 重置節點狀態（歸還時）
     */
    private resetNodeForReturn(node: cc.Node): void {
        // 停止所有動作和動畫
        node.stopAllActions();
        
        // 重置變換
        node.position = cc.Vec3.ZERO;
        node.scale = 1;
        node.angle = 0;
        node.opacity = 255;
        
        // 如果有IWindow組件，調用close方法
        const comps = node.getComponents(cc.Component);
        const windowComp = comps.find(c => typeof (c as any).close === "function");
        if (windowComp && typeof (windowComp as any).close === "function") {
            (windowComp as any).close();
        }
        
        // 重置動畫組件（如果有）
        const animComp = node.getComponent("PopupAnimationComponent");
        if (animComp && typeof animComp.reset === "function") {
            animComp.reset();
        }
    }

    /**
     * 異步載入prefab
     */
    private loadPrefabAsync(path: string): Promise<cc.Prefab> {
        return new Promise((resolve, reject) => {
            cc.resources.load<cc.Prefab>(path, (err, prefab) => {
                if (err || !prefab) {
                    return reject(err);
                }
                resolve(prefab);
            });
        });
    }

    /**
     * 清理所有資源（場景切換時調用）
     */
    public clearAll(): void {
        // 清理借出狀態
        this.borrowedNodes.clear();
        
        // 銷毀所有節點
        this.nodePool.forEach((node, popupName) => {
            if (node && node.isValid) {
                node.destroy();
            }
        });
        this.nodePool.clear();
        
        // 清理prefab緩存
        this.prefabMap.clear();
        
        // 重置狀態
        this.isPreloading = false;
        this.preloadComplete = false;
        
        cc.log("[PrefabManager] 已清理所有資源");
    }

    /**
     * 獲取節點池狀態詳情（調試用）
     */
    public getNodePoolStatus(): {[popupName: string]: {available: boolean, borrowed: boolean}} {
        const status = {};
        
        this.nodePool.forEach((node, popupName) => {
            status[popupName] = {
                available: !this.borrowedNodes.has(popupName),
                borrowed: this.borrowedNodes.has(popupName)
            };
        });
        
        return status;
    }
}

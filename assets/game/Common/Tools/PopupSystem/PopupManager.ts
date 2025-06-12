import BaseSingletonComponent from "../Base/BaseSingletonComponent";
import { PopupName, ClosePopupAnimationConfig, ShowPopupAnimationConfig } from "./PopupConfig";
import { PopupAnimationType } from "./PopupAnimationComponent";
import PrefabManager from "./PrefabManager";
import { IWindow } from "./IWindow";
import { CommonTool } from "../CommonTool";

const { ccclass, property } = cc._decorator;

/**
 * 🎯 PopupManager - Popup顯示管理器
 * 
 * 職責：
 * 1. 提供統一的showPopup/closePopup API
 * 2. 處理防抖邏輯，避免重複快速點擊
 * 3. 確保每個popup只能同時開啟一個實例
 * 4. 從PrefabManager借出/歸還節點
 * 5. 管理popup的顯示層級
 */
@ccclass
export default class PopupManager extends BaseSingletonComponent {
    public static instance: PopupManager = null;

    @property({
        displayName: "Popup根節點",
        tooltip: "所有popup的父節點容器"
    })
    @property(cc.Node)
    public popupRoot: cc.Node = null;

    @property({
        displayName: "全局遮罩節點",
        tooltip: "防止在popup切換時重複點擊的全局遮罩"
    })
    @property(cc.Node)
    public maskBGTOP: cc.Node = null;

    // 當前顯示中的popup映射
    private activePopupMap: Map<string, cc.Node> = new Map();

    public static getInstance(): PopupManager {
        return this._getInstance(PopupManager);
    }

    // ======================== 公共API ========================

    /**
     * 🎯 顯示popup（即時顯示，無防抖延遲）
     */
    public static showPopup(name: PopupName, data?: any): cc.Node {
        return this.getInstance()?.showPopup(name, data);
    }

    /**
     * 🎯 關閉popup（即時關閉，無防抖延遲）
     */
    public static closePopup(name: PopupName): void {
        this.getInstance()?.closePopup(name);
    }

    /**
     * 🎯 獲取當前顯示的popup節點
     */
    public static getActivePopup(name: PopupName): cc.Node | undefined {
        return this.getInstance()?.getActivePopup(name);
    }

    /**
     * 🎯 檢查popup是否正在顯示
     */
    public static isPopupShowing(name: PopupName): boolean {
        return this.getInstance()?.isPopupShowing(name) || false;
    }

    /**
     * 🎯 關閉所有popup
     */
    public static closeAll(): void {
        this.getInstance()?.closeAllPopups();
    }

    /**
     * 🎯 獲取當前顯示的popup數量
     */
    public static getActivePopupCount(): number {
        return this.getInstance()?.getActivePopupCount() || 0;
    }

    /**
     * 🛡️ 顯示全局遮罩（手動控制）
     */
    public static showGlobalMask(): void {
        const instance = this.getInstance();
        if (instance?.maskBGTOP) {
            instance.maskBGTOP.active = true;
        }
    }

    /**
     * 🛡️ 隱藏全局遮罩（手動控制）
     */
    public static hideGlobalMask(): void {
        const instance = this.getInstance();
        if (instance?.maskBGTOP) {
            instance.maskBGTOP.active = false;
        }
    }

    /**
     * 🛡️ 檢查全局遮罩是否顯示
     */
    public static isGlobalMaskShowing(): boolean {
        const instance = this.getInstance();
        return instance?.maskBGTOP?.active || false;
    }

    // ======================== 內部實現 ========================

    /**
     * 實際顯示popup的邏輯
     */
    private showPopup(name: PopupName, data?: any): cc.Node {
        // 0. 檢查是否已經在顯示中
        if (this.activePopupMap.has(name)) {
            const existingNode = this.activePopupMap.get(name);
            if (existingNode && existingNode.isValid) {
                // 重新調用open方法傳遞新數據
                const comp = this.getIWindowComponent(existingNode);
                if (comp?.open) {
                    comp.open(data);
                }
                
                // 確保在最前面
                existingNode.setSiblingIndex(this.popupRoot.childrenCount - 1);
                return existingNode;
            } else {
                // 清理無效節點
                this.activePopupMap.delete(name);
            }
        }

        // 1. 顯示全局遮罩，防止重複點擊
        if (this.maskBGTOP) {
            this.maskBGTOP.active = true;
        }

        // 2. 檢查PrefabManager中是否有可用節點
        if (!PrefabManager.getInstance().isNodeAvailable(name)) {
            cc.error(`[PopupManager] ${name} 節點不可用，可能未預加載或已被借出`);
            // 隱藏全局遮罩
            if (this.maskBGTOP) {
                this.maskBGTOP.active = false;
            }
            return null;
        }

        // 3. 從PrefabManager借出節點
        const node = PrefabManager.getInstance().borrowNode(name);
        if (!node) {
            cc.error(`[PopupManager] 無法從PrefabManager借出 ${name} 節點`);
            // 隱藏全局遮罩
            if (this.maskBGTOP) {
                this.maskBGTOP.active = false;
            }
            return null;
        }

        // 4. 添加到popupRoot並設置
        node.parent = this.popupRoot;
        node.setSiblingIndex(this.popupRoot.childrenCount - 1);

        // 5. 調用組件的open方法
        const comp = this.getIWindowComponent(node);
        if (comp?.open) {
            comp.open(data);
        }

        // 6. 播放進入動畫
        const animationType = ShowPopupAnimationConfig[name] || PopupAnimationType.None;
        const animComp = node.getComponent("PopupAnimationComponent");
        if (animComp) {
            // 設置動畫完成後隱藏全局遮罩的回調
            const originalPlayEnter = animComp.playEnter.bind(animComp);
            animComp.playEnter = (type: PopupAnimationType) => {
                originalPlayEnter(type);
                // 動畫完成後隱藏全局遮罩
                this.scheduleOnce(() => {
                    if (this.maskBGTOP) {
                        this.maskBGTOP.active = false;
                    }
                }, type === PopupAnimationType.None ? 0 : 0.35); // 動畫時間 + 小緩衝
            };
            animComp.playEnter(animationType);
            // 恢復原始方法
            animComp.playEnter = originalPlayEnter;
        } else {
            // 沒有動畫，立即隱藏全局遮罩
            if (this.maskBGTOP) {
                this.maskBGTOP.active = false;
            }
        }

        // 7. 添加到活躍popup映射
        this.activePopupMap.set(name, node);
        return node;
    }

    /**
     * 實際關閉popup的邏輯
     */
    private closePopup(name: PopupName): void {
        const node = this.activePopupMap.get(name);
        if (!node || !node.isValid) {
            // 清理可能的無效映射
            this.activePopupMap.delete(name);
            return;
        }

        // 顯示全局遮罩，防止關閉過程中重複點擊
        if (this.maskBGTOP) {
            this.maskBGTOP.active = true;
        }

        // 播放退出動畫
        const animationType = ClosePopupAnimationConfig[name] || PopupAnimationType.None;
        const animComp = node.getComponent("PopupAnimationComponent");
        
        if (animComp) {
            animComp.playExit(animationType, () => {
                this.finishClosePopup(name, node);
            });
        } else {
            // 沒有動畫，直接完成關閉
            this.finishClosePopup(name, node);
        }
    }

    /**
     * 完成popup關閉的處理
     */
    private finishClosePopup(name: PopupName, node: cc.Node): void {
        // 從活躍映射中移除
        this.activePopupMap.delete(name);
        
        // 歸還節點給PrefabManager
        PrefabManager.getInstance().returnNode(name);
        
        // 隱藏全局遮罩
        if (this.maskBGTOP) {
            this.maskBGTOP.active = false;
        }
    }

    /**
     * 關閉所有popup
     */
    private closeAllPopups(): void {
        const activePopups = Array.from(this.activePopupMap.keys());
        
        activePopups.forEach(popupName => {
            this.closePopup(popupName as PopupName);
        });
    }

    /**
     * 獲取當前顯示的popup節點
     */
    private getActivePopup(name: PopupName): cc.Node | undefined {
        const node = this.activePopupMap.get(name);
        return (node && node.isValid) ? node : undefined;
    }

    /**
     * 檢查popup是否正在顯示
     */
    private isPopupShowing(name: PopupName): boolean {
        const node = this.activePopupMap.get(name);
        return node && node.isValid && node.active;
    }

    /**
     * 獲取當前顯示的popup數量
     */
    private getActivePopupCount(): number {
        return this.activePopupMap.size;
    }

    /**
     * 獲取IWindow組件
     */
    private getIWindowComponent(node: cc.Node): IWindow | null {
        const comps = node.getComponents(cc.Component);
        const target = comps.find(c => typeof (c as any).open === "function");
        return target ? (target as unknown as IWindow) : null;
    }

    /**
     * 🔧 調試方法：獲取當前狀態
     */
    public getDebugStatus(): {
        activePopups: string[];
        prefabManagerStatus: any;
    } {
        return {
            activePopups: Array.from(this.activePopupMap.keys()),
            prefabManagerStatus: PrefabManager.getInstance().getPreloadStatus()
        };
    }
}

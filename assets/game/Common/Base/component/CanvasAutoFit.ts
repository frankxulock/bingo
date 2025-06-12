import EventManager, { GameStateUpdate } from "../../Tools/Base/EventManager";
import { CommonTool } from "../../Tools/CommonTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CanvasAutoFit extends cc.Component {

    /** 設計稿的解析度 */
    private readonly designWidth = 390;
    private readonly designHeight = 800;

    /** 追蹤螢幕尺寸變化 */
    private lastFrameWidth: number = 0;
    private lastFrameHeight: number = 0;
    private lastInnerWidth: number = 0;
    private lastInnerHeight: number = 0;

    protected start(): void {
        const canvas = this.getComponent(cc.Canvas);
        if (!canvas) return;
    
        this.updateDesignResolution();
    
        // ✅ 處理真正 resize（部分平台有效）
        cc.view.setResizeCallback(() => {
            this.checkAndUpdate();
        });
    
        // ✅ 瀏覽器環境補強：避免 DevTools 切換裝置無法觸發 resize
        if (cc.sys.isBrowser) {
            this.schedule(this.checkAndUpdate, 0.2);
        }
    }

    /** 檢查尺寸是否改變，有變更時才更新避免效能問題 */
    private checkAndUpdate = () => {
        const frameSize = cc.view.getFrameSize();
        const currentInnerWidth = window.innerWidth;
        const currentInnerHeight = window.innerHeight;

        // 檢查是否有尺寸變化
        const hasFrameSizeChanged = 
            this.lastFrameWidth !== frameSize.width || 
            this.lastFrameHeight !== frameSize.height;
            
        const hasWindowSizeChanged = 
            this.lastInnerWidth !== currentInnerWidth || 
            this.lastInnerHeight !== currentInnerHeight;

        // 只有在尺寸真的改變時才更新
        if (hasFrameSizeChanged || hasWindowSizeChanged) {
            // 更新記錄的尺寸
            this.lastFrameWidth = frameSize.width;
            this.lastFrameHeight = frameSize.height;
            this.lastInnerWidth = currentInnerWidth;
            this.lastInnerHeight = currentInnerHeight;

            // 執行更新
            this.updateDesignResolution();
        }
    };

    /** 根據裝置類型與畫面大小設定設計解析度 */
    private updateDesignResolution() {
        const canvas = this.getComponent(cc.Canvas);
        const frameSize = cc.view.getFrameSize();

        if (CommonTool.shouldUseMobileMode()) {
            // 📱 手機模式 - 固定高度，寬度自適應
            const frameWidth = frameSize.width;
            const frameHeight = frameSize.height;
            
            // 根據螢幕比例計算適應的寬度
            const screenRatio = frameWidth / frameHeight;
            const designRatio = this.designWidth / this.designHeight;
            
            if (screenRatio > designRatio) {
                // 螢幕比設計稿寬，固定高度
                cc.view.setDesignResolutionSize(this.designWidth, this.designHeight, cc.ResolutionPolicy.FIXED_HEIGHT);
            } else {
                // 螢幕比設計稿窄，固定寬度
                cc.view.setDesignResolutionSize(this.designWidth, this.designHeight, cc.ResolutionPolicy.FIXED_WIDTH);
            }

        } else {
            // 💻 電腦或橫向平板
            canvas.fitWidth = true;
            canvas.fitHeight = true;
        }

        this.relayoutUI();
    }

    /** UI 重新排版 */
    private relayoutUI() {
        // 等待解析度變更換幣後再執行刷新排版的功能
        this.scheduleOnce(() => {
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_Canvas);
        }, 0);
    }
}

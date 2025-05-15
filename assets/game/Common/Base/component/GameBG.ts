const { ccclass, property } = cc._decorator;

@ccclass
export default class gameBG extends cc.Component {

    @property({ type: cc.Node, tooltip: '背景圖片節點' })
    gameBG: cc.Node = null;

    private imgElement: HTMLCanvasElement | null = null;
    private resizeHandler: () => void;  // 儲存綁定的事件函式引用，方便移除事件監聽

    protected start(): void {
        // 取得 Canvas HTML 元素 (Cocos Creator 預設 Canvas id 為 'GameCanvas')
        this.imgElement = document.getElementById('GameCanvas') as HTMLCanvasElement | null;

        // 綁定 resizeBG 函式，確保 this 指向正確且方便移除監聽
        this.resizeHandler = this.resizeBG.bind(this);

        // 初始調整背景大小
        this.resizeBG();

        // 監聽瀏覽器視窗大小改變事件，動態調整背景寬度
        window.addEventListener('resize', this.resizeHandler);
    }

    /**
     * 調整背景圖片寬度，保持設計高度比例
     */
    private resizeBG(): void {
        if (!this.imgElement || !this.gameBG) return;

        // 取得當前視窗尺寸
        const frameSize = cc.view.getFrameSize();

        // 設計參考高度，依據設計稿設定
        const targetDesignHeight = 844;

        // 計算縮放比例 (設計高度 / 實際視窗高度)
        const scaleY = targetDesignHeight / frameSize.height;

        // 計算背景新寬度，維持比例
        const newWidth = frameSize.width * scaleY;

        // 設定背景節點寬度，達成背景圖片等比縮放
        this.gameBG.width = newWidth;
    }

    protected onDestroy(): void {
        // 移除 resize 事件監聽，避免記憶體洩漏
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
    }
}

import BaseSingletonComponent from "../Base/BaseSingletonComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastManager extends BaseSingletonComponent {

    @property(cc.Prefab)
    toastPrefab: cc.Prefab = null;

    @property(cc.Node)
    toastParent: cc.Node = null;

    public static getInstance(): ToastManager {
        return this._getInstance(ToastManager);
    }

    public static showToast(msg: string): void {
        this.getInstance()?.show(msg);
    }

    /** 顯示 Toast 訊息 */
    public show(message: string, duration: number = 2) {
        if (!this.toastPrefab || !this.toastParent) {
            cc.warn("ToastManager 缺少 toastPrefab 或 toastParent");
            return;
        }

        const toastNode = cc.instantiate(this.toastPrefab);
        toastNode.parent = this.toastParent;

        const label = toastNode.getComponentInChildren(cc.Label);
        if (label) label.string = message;

        toastNode.opacity = 0;
        toastNode.y = 0;

        cc.tween(toastNode)
            .to(0.2, { opacity: 255, y: 30 })
            .delay(duration)
            .to(0.3, { opacity: 0, y: 60 })
            .call(() => toastNode.destroy())
            .start();
    }

    protected init(): void {
        // cc.log("ToastManager 初始化完成");
    }
}

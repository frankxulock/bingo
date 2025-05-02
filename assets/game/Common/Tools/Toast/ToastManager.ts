const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastManager extends cc.Component {
    @property(cc.Prefab)
    toastPrefab: cc.Prefab = null;

    @property(cc.Node)
    toastParent: cc.Node = null;

    private static _instance: ToastManager = null;

    public static get instance(): ToastManager {
        if (!this._instance) {
            cc.warn("ToastManager 尚未初始化！");
        }
        return this._instance;
    }

    onLoad() {
        if (ToastManager._instance && ToastManager._instance !== this) {
            this.destroy(); // 保證單例唯一
            return;
        }
        ToastManager._instance = this;
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
}

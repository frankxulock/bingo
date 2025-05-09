const { ccclass } = cc._decorator;

@ccclass
export default abstract class BaseSingletonComponent extends cc.Component {
    private static _instanceMap: Map<Function, any> = new Map();

    /** ✅ 單例取得 */
    protected static _getInstance<T>(cls: new () => T): T {
        return BaseSingletonComponent._instanceMap.get(cls);
    }

    /** ✅ 單例註冊 & 初始化 */
    protected onLoad(): void {
        const cls = this.constructor;
        if (BaseSingletonComponent._instanceMap.has(cls)) {
            this.node.destroy();
            return;
        }

        BaseSingletonComponent._instanceMap.set(cls, this);

        if (this.isPersistent) {
            cc.game.addPersistRootNode(this.node);
        }

        if (typeof (this as any).init === 'function') {
            (this as any).init();
        }
    }

    protected get isPersistent(): boolean {
        return true;
    }

    /** ✅ 單例刪除 */
    public static deleteInstance<T>(cls: new () => T): void {
        const instance = BaseSingletonComponent._instanceMap.get(cls);
        if (instance) {
            instance.node.destroy();
            BaseSingletonComponent._instanceMap.delete(cls);
        }
    }
}

import PrefabManager from "./PrefabManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupManager extends cc.Component {
    public static instance: PopupManager = null;

    @property(cc.Node)
    public popupRoot: cc.Node = null;

    private popupMap: Map<string, cc.Node> = new Map();

    onLoad() {
        if (PopupManager.instance) {
            this.destroy();
            return;
        }
        PopupManager.instance = this;
    }

    public showPopup(name: string, data?: any): cc.Node {
        if (this.popupMap.has(name)) return this.popupMap.get(name);

        let showPrefab = PrefabManager.instance.getPrefab(name);
        const node = cc.instantiate(showPrefab);
        node.name = name;

        this.popupRoot.addChild(node);
        node.setSiblingIndex(this.popupRoot.childrenCount - 1);

        const comp = node.getComponent(node.name) || node.getComponentInChildren(cc.Component);
        if (comp && typeof comp["init"] === "function") comp["init"](data);

        this.popupMap.set(name, node);
        return node;
    }

    public closePopup(name: string) {
        if (!this.popupMap.has(name)) return;
        const node = this.popupMap.get(name);
        if (node && node.isValid) node.destroy();
        this.popupMap.delete(name);
    }

    public closeAll() {
        this.popupMap.forEach(node => {
            if (node && node.isValid) node.destroy();
        });
        this.popupMap.clear();
    }
}

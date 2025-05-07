import { IWindow } from "./IWindow";
import PrefabManager from "./PrefabManager";

const { ccclass, property } = cc._decorator;

export class PopupName {
    public static ConfirmPurchasePage = "ConfirmPurchasePage";
    public static ResultPage = "ResultPage";
    public static RewardPopupPage = "RewardPopupPage";
    public static DIYCardSelectionPage = "DIYCardSelectionPage";
    public static DIYEditPage = "DIYEditPage";
    public static CardPurchasePopupPage = "CardPurchasePopupPage";
    // 可依需求擴充更多彈窗名稱
}

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

    /**
     * 顯示彈窗
     * @param name 預製體名稱（必須在 PrefabManager 中註冊）
     * @param data 傳入給彈窗的資料
     */
    public showPopup(name: string, data?: any): cc.Node {
        if (this.popupMap.has(name)) {
            const existingNode = this.popupMap.get(name);
            existingNode.setSiblingIndex(this.popupRoot.childrenCount - 1); // bring to front
            const existingComp = this.getIWindowComponent(existingNode);
            if (existingComp?.open) {
                existingComp.open(data); // optional 更新資料
            }
            return existingNode;
        }

        const showPrefab = PrefabManager.instance.getPrefab(name);
        if (!showPrefab) {
            console.error(`此視窗不存在: ${name}`, data);
            return null;
        }

        const node = cc.instantiate(showPrefab);
        node.name = name;

        this.popupRoot.addChild(node);
        node.setSiblingIndex(this.popupRoot.childrenCount - 1);

        const comp = this.getIWindowComponent(node);
        if (comp?.open) {
            comp.open(data);
        } else {
            console.warn(`Prefab [${name}] 未實作 open(data) 方法`);
        }

        this.popupMap.set(name, node);
        return node;
    }

    /**
     * 關閉指定彈窗
     * @param name 預製體名稱
     */
    public closePopup(name: string) {
        const node = this.popupMap.get(name);
        if (!node || !node.isValid) return;
        node.destroy();
        // // 執行動畫淡出後銷毀（可選）
        // node.runAction(
        //     cc.sequence(
        //         cc.fadeOut(0.2),
        //         cc.callFunc(() => {
        //             node.destroy();
        //         })
        //     )
        // );

        this.popupMap.delete(name);
    }

    /**
     * 關閉所有彈窗
     */
    public closeAll() {
        this.popupMap.forEach(node => {
            if (node && node.isValid) {
                node.runAction(
                    cc.sequence(
                        cc.fadeOut(0.2),
                        cc.callFunc(() => {
                            node.destroy();
                        })
                    )
                );
            }
        });
        this.popupMap.clear();
    }

    /**
     * 取得目前已顯示的彈窗
     * @param name 預製體名稱
     */
    public getPopup(name: string): cc.Node | undefined {
        return this.popupMap.get(name);
    }

    /**
     * 嘗試從節點中取得實作 IWindow 的元件
     */
    private getIWindowComponent(node: cc.Node): IWindow | null {
        const comps = node.getComponents(cc.Component);
        const target = comps.find(c => typeof (c as any).open === "function");
        return target ? (target as unknown as IWindow) : null;
    }
}

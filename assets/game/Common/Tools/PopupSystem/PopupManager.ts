import BaseSingletonComponent from "../Base/BaseSingletonComponent";
import { IWindow } from "./IWindow";
import PrefabManager from "./PrefabManager";
import { PopupName, ClosePopupAnimationConfig, ShowPopupAnimationConfig } from "./PopupConfig";
import { PopupAnimationType } from "./PopupAnimationComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupManager extends BaseSingletonComponent {
    public static instance: PopupManager = null;

    @property(cc.Node)
    public popupRoot: cc.Node = null;

    private popupMap: Map<string, cc.Node> = new Map();

    public static getInstance(): PopupManager {
        return this._getInstance(PopupManager);
    }

    public static async showPopup(name: PopupName, data?: any): Promise<cc.Node> {
        return this.getInstance()?.showPopup(name, data);
    }

    public static closePopup(name: PopupName) {
        this.getInstance()?.closePopup(name);
    }

    public async showPopup(name: PopupName, data?: any): Promise<cc.Node> {
        if (this.popupMap.has(name)) {
            const existingNode = this.popupMap.get(name);
            existingNode.setSiblingIndex(this.popupRoot.childrenCount - 1);
            const existingComp = this.getIWindowComponent(existingNode);
            if (existingComp?.open) {
                existingComp.open(data);
            }
            return existingNode;
        }

        const prefab = await PrefabManager.getInstance().getOrLoadPrefab(name);
        const node = cc.instantiate(prefab);
        node.name = name;

        this.popupRoot.addChild(node);
        node.setSiblingIndex(this.popupRoot.childrenCount - 1);

        const comp = this.getIWindowComponent(node);
        if (comp?.open) {
            comp.open(data);
        }

        // 從 PopupConfig 取得動畫類型
        const animationType = ShowPopupAnimationConfig[name] || PopupAnimationType.None;

        // 執行動畫（如果有）
        const animComp = node.getComponent("PopupAnimationComponent");
        if (animComp) {
            animComp.playEnter(animationType);
        }

        this.popupMap.set(name, node);
        return node;
    }

    public closePopup(name: PopupName) {
        const node = this.popupMap.get(name);
        if (!node || !node.isValid) return;

        // 從 PopupConfig 取得動畫類型
        const animationType = ClosePopupAnimationConfig[name] || PopupAnimationType.None;

        // 執行動畫（如果有）
        const animComp = node.getComponent("PopupAnimationComponent");
        if (animComp) {
            animComp.playExit(animationType, ()=>{
                node.destroy();
                this.popupMap.delete(name);
            });
        }
    }

    public closeAll() {
        this.popupMap.forEach(node => {
            if (node && node.isValid) {
                node.destroy();
            }
        });
        this.popupMap.clear();
    }

    public getPopup(name: PopupName): cc.Node | undefined {
        return this.popupMap.get(name);
    }

    private getIWindowComponent(node: cc.Node): IWindow | null {
        const comps = node.getComponents(cc.Component);
        const target = comps.find(c => typeof (c as any).open === "function");
        return target ? (target as unknown as IWindow) : null;
    }
}

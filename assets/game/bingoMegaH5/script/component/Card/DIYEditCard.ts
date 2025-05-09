import EventManager, { GameStateUpdate } from "../../../../Common/Tools/Base/EventManager";
import ToastManager from "../../../../Common/Tools/Toast/ToastManager";
import CardIcon from "./CardIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DIYEditCard extends cc.Component {
    @property({ type: cc.Toggle, visible: true })
    private DIYEditCard: cc.Toggle = null;

    @property({ type: cc.Node, visible: true })
    private Node_NumberGroup: cc.Node = null;

    private cardItems: CardIcon[] = [];
    private data: any = null;

    setData(cardData: any, index?: number): void {
        this.data = cardData;
        let viewData = cardData.cardInfo;

        if (!this.cardItems.length) {
            this.cardItems = this.Node_NumberGroup.getComponentsInChildren(CardIcon);
        }

        this.cardItems.forEach((item, index) => {
            let number = viewData[index] ?? "DIY";
            item.setLabel(number);
        });

        this.DIYEditCard.interactable = !cardData.isPurchased;
        this.DIYEditCard.isChecked = cardData.isSelected;

        this.DIYEditCard.node.off("toggle", this.onToggleChanged, this); // 防止重複綁定
        this.DIYEditCard.node.on("toggle", this.onToggleChanged, this);
    }

    /** 玩家勾選變更 */
    private onToggleChanged(toggle: cc.Toggle): void {
        if (this.data.isPurchased) {
            this.DIYEditCard.isChecked = false;
            ToastManager.showToast("此卡片已购买，不能重复购买。请更改数字或选择新的卡片。");
            return;
        }

        // 發送事件給父節點（DIYCardSelectionPage 透過 ScrollLazyLoader 接收）
        this.node.emit("ItemEvent", {
            id: this.data.id,
            isChecked: toggle.isChecked,
        });
    }

    /** 編輯按鈕 */
    public onEdit(): void {
        if(this.DIYEditCard.interactable)
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_OpenDIYEditPage, this.data);
    }

    /** 刪除按鈕 */
    public onDelete(): void {
        if(this.DIYEditCard.interactable)
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_DeleteDIYCard, this.data);
    }
}

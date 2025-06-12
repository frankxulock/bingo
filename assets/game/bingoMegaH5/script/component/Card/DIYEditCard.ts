import EventManager, { GameStateUpdate } from "../../../../Common/Tools/Base/EventManager";
import { CommonTool } from "../../../../Common/Tools/CommonTool";
import { PopupName } from "../../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../../Common/Tools/PopupSystem/PopupManager";
import ToastManager from "../../../../Common/Tools/Toast/ToastManager";
import { HttpServer } from "../../HttpServer";
import CardIcon from "./CardIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DIYEditCard extends cc.Component {
    // 勾選框：是否選擇此自訂卡片
    @property({ type: cc.Toggle, visible: true })
    private DIYEditCard: cc.Toggle = null;

    // 顯示數字的節點群組（每個數字由 CardIcon 呈現）
    @property({ type: cc.Node, visible: true })
    private Node_NumberGroup: cc.Node = null;
    // 數字
    @property({ type: cc.Node, visible: true })
    private Node_NumberTxtGroup: cc.Node = null;

    private cardItems: CardIcon[] = []; // 存放每個顯示的 CardIcon 實例
    private cardTxt: cc.Label[] = [];
    private cardText: cc.Color[] = [
        new cc.Color(29, 29, 29),
        new cc.Color(255, 255, 255),
        new cc.Color(254, 88, 42)
    ];
    private data: any = null; // 當前卡片的資料
    private index : number = 0;

    /** 設定此卡片的資料與顯示狀態 */
    setData(cardData: any, index?: number): void {
        this.data = cardData;
        this.index = index;
        const viewData = cardData.cardInfo;

        // 若未初始化 cardItems，則從子節點抓取所有 CardIcon
        if (!this.cardItems.length) {
            this.cardItems = this.Node_NumberGroup.getComponentsInChildren(CardIcon);
        }
        if(this.cardTxt.length == 0) {
            this.cardTxt = this.Node_NumberTxtGroup.getComponentsInChildren(cc.Label);     
        }

        // 將每個 CardIcon 顯示對應的數字，若無則顯示 DIY
        this.cardItems.forEach((item, index) => {
            let haveData = (viewData[index] != null) ? true : false;
            const number = haveData ? viewData[index] : "DIY";
            const color = haveData ? 0 : 1;
            this.setLabel(this.cardTxt[index], number, color);
        });

        // 根據是否已購買設定是否可互動
        this.DIYEditCard.interactable = !cardData.isPurchased;
        // 根據資料決定勾選狀態
        this.DIYEditCard.isChecked = cardData.isSelected;

        // 移除舊有監聽，避免重複綁定
        this.DIYEditCard.node.off("toggle", this.onToggleChanged, this);
        // 綁定新的勾選變更事件
        this.DIYEditCard.node.on("toggle", this.onToggleChanged, this);
    }

    /** 勾選狀態改變事件 */
    private onToggleChanged(toggle: cc.Toggle): void {
        if (this.data.isPurchased) {
            this.DIYEditCard.isChecked = false;
            ToastManager.showToast("This card has already been purchased and cannot be purchased again. Please change the number or select a new card.");
            return;
        }

        // 向父節點發送 ItemEvent（例如 DIYCardSelectionPage 監聽）
        this.node.emit("ItemEvent", {
            id: this.data.id,
            isChecked: toggle.isChecked,
        });
    }

    /** 編輯按鈕事件 */
    public onEdit(): void {
        let EditData = {
            data : this.data,
            id : this.index - 1
        }
        if (this.DIYEditCard.interactable) {
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_OpenDIYEditPage, EditData);
        }
    }

    /** 刪除按鈕事件 */
    public onDelete(): void {
        if (this.DIYEditCard.interactable) {
            let DeleteData = {
                id: this.data.id,
                data: this.data,
            }
            PopupManager.showPopup(PopupName.DIYCardDeletePage, DeleteData);
        }
    }

    /**
     * 設定顯示的文字內容
     * @param txt 要設定的文字內容
     */
    public setLabel(text : cc.Label , txt: string, numberItem : number) {
        text.node.color = this.cardText[numberItem];
        CommonTool.setLabel(text, txt);
    }
}

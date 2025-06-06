import EventManager, { GameStateUpdate } from "../../../../Common/Tools/Base/EventManager";
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
    private cardTxt: cc.RichText[] = [];
    private cardText: string[] = [
        "#1d1d1d", // new cc.Color(29, 29, 29)
        "#ffffff", // new cc.Color(255, 255, 255)
        "#fe582a", // new cc.Color(254, 88, 42)
    ];
    private data: any = null; // 當前卡片的資料

    /** 設定此卡片的資料與顯示狀態 */
    setData(cardData: any, index?: number): void {
        this.data = cardData;
        const viewData = cardData.cardInfo;

        // 若未初始化 cardItems，則從子節點抓取所有 CardIcon
        if (!this.cardItems.length) {
            this.cardItems = this.Node_NumberGroup.getComponentsInChildren(CardIcon);
        }
        if(this.cardTxt.length == 0) {
            this.cardTxt = this.Node_NumberTxtGroup.getComponentsInChildren(cc.RichText);     
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
            ToastManager.showToast("此卡片已购买，不能重复购买。请更改数字或选择新的卡片。");
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
        if (this.DIYEditCard.interactable) {
            EventManager.getInstance().emit(
                GameStateUpdate.StateUpdate_OpenDIYEditPage,
                this.data
            );
        }
    }

    /** 刪除按鈕事件 */
    public onDelete(): void {
        if (this.DIYEditCard.interactable) {
            console.log(this.data.id);
            HttpServer.DIYDelete(this.data.id)
            .then(results => {
                EventManager.getInstance().emit(
                    GameStateUpdate.StateUpdate_DeleteDIYCard,
                    this.data
                );
                HttpServer.DIYCardList()
                .then(results => {
                    console.error("results : ", results);
                });
            });
        }
    }

    /**
     * 設定顯示的文字內容
     * @param txt 要設定的文字內容
     */
    public setLabel(text : cc.RichText , txt: string, numberItem : number) {
        let color = `<color=${this.cardText[numberItem]}>${txt}</color>`;
        text.string = color;
    }
}

import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupManager/IWindow";
import PopupManager, { PopupName } from "../../../Common/Tools/PopupManager/PopupManager";
import ScrollLazyLoader from "../component/ScrollLazyLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DIYCardSelectionPage extends cc.Component implements IWindow {

    @property({ type: cc.Label, visible: true })
    private Label_currentDIYCardCount: cc.Label = null;
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_DIYList: ScrollLazyLoader = null;
    @property({ type: cc.Node, visible: true })
    private Node_typesetting: cc.Node = null;
    @property({ type: cc.Toggle, visible: true })
    private Toggle_selectAll: cc.Toggle = null;
    @property({ type: cc.Label, visible: true })
    private Label_select: cc.Label = null;

    private uniqueCards = [];

    open(data : any): void {
        let d = data;
        this.uniqueCards = d.uniqueCards;

        // DIYmaxCard: this.DIYmaxCard,      // 同時收藏最多DIY卡片數量
        // haveDIYCard: DIYCard,             // 已購買的 DIY 卡
        // DIYCardList: this.DIYCardList,    // 收藏的 DIY 卡
        // duplicatedCards: duplicatedCards, // 重複卡
        // uniqueCards: uniqueCards,         // 未購買卡

        CommonTool.setLabel(this.Label_select, `0`);
        CommonTool.setLabel(this.Label_currentDIYCardCount, `(${d.DIYCardList.length}/${d.DIYmaxCard})`);

        this.ScrollView_DIYList.refreshData(d.DIYCardList);
        this.Node_typesetting.active = (d.DIYCardList.length === 0) ? true : false;
        this.Toggle_selectAll.node.on("Toggle", this.OnSelectAll, this);
    }
    close(): void {
        PopupManager.instance.closePopup(PopupName.DIYCardSelectionPage);
    }

    /** 開啟DIY編輯卡片頁面 */
    public OpenDIYEditPage() {
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_OpenDIYEditPage);
    }

    /** 按下DIY購卡確認購買事件 => 開啟確認購買頁面 */
    public OnConfirm() {
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_OpenDIYEditPage);
    }

    /** 勾選全部的DIY卡片 */
    public OnSelectAll() {
        this.i
    }
}

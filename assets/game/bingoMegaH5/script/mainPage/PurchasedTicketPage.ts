import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import ScrollLazyLoader from "../../../Common/Tools/Scroll/ScrollLazyLoader";
import VirtualScrollView from "../../../Common/Tools/Scroll/VirtualScrollView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PurchasedTicketPage extends MegaComponent {
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_PrizeOverview: ScrollLazyLoader = null;
    @property({ type: VirtualScrollView, visible: true })
    private ScrollView_CardGroup: VirtualScrollView = null;
    @property({ type: cc.Node, visible: true })
    private Btn_AddCard: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Btn_PreBuyCard: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_TotaiWin: cc.Node = null;
    @property({ type: cc.Label, visible: true })
    private Label_totaiWin: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Node_content: cc.Node = null;

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateEvent.GAME_DRAWTHENUMBERS, this.onSnapshot, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendBall, this.setPageState, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage, this.showAction, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateEvent.GAME_DRAWTHENUMBERS, this.onSnapshot, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SendBall, this.setPageState, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage, this.showAction, this);
    }

    protected init(): void {
        super.init();
        this.Btn_AddCard.on('click', this.OpenCardPurchasePage, this);
        this.Btn_PreBuyCard.on('click', this.OpenCardPurchasePage, this);
        this.node.active = false;
    }

    /** 開啟購卡介面 */
    private OpenCardPurchasePage() {
        // console.log("開啟購卡介面");
        this.data.setCardContent(0);
        this.data.setPlayState(0);
        PopupManager.showPopup(PopupName.CardPurchasePopupPage);
    }

    /** 展示頁面 */
    public showAction() {
        this.node.active = true;
        this.ScrollView_CardGroup.scrollToTop();
        this.setPageState();
    }

    /** 快照恢復 */
    protected onSnapshot(): void {
        this.node.active = !this.data.ActualNumberofCardsPurchased();
        this.setPageState();
    }

    /** 遊戲結束事件 重置目前內容 */
    protected onNewGame(): void {
        this.onSnapshot();
        let PrizeContent = this.ScrollView_PrizeOverview.content;
        let NoHavePrizeItem = (PrizeContent.children.length == 0);
        if(NoHavePrizeItem){
            PrizeContent.height = 0;
            this.Node_content.getComponent(cc.Layout).updateLayout();
        }
    }

    /** 更新確認頁面的內容 */
    public setPageState() {
        let d = this.data.getPurchasedTicketPageData();
        this.ScrollView_CardGroup.refreshData(d.cardData);
        this.ScrollView_PrizeOverview.refreshData(d.pendingWinnerItem);
        // 底部欄位展示內容( 0:可以購買當局卡,1:可以購買預購卡,2顯示已經中獎金額,3:不展示 )
        let BottomBtnState = d.BottomBtnState;
        this.Btn_AddCard.active = (BottomBtnState == 0) ? true : false;
        this.Btn_PreBuyCard.active = (BottomBtnState == 1) ? true : false;
        this.Node_TotaiWin.active = (BottomBtnState == 2) ? true : false;
        CommonTool.setLabel(this.Label_totaiWin, CommonTool.formatMoney2(d.totalWin, "+"));
 
        let action = (this.ScrollView_PrizeOverview.content.children.length == 0);
        this.ScrollView_PrizeOverview.node.active = action;
    }
}

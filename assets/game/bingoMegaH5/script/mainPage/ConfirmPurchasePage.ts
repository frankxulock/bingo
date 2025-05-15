import MegaComponent from "../../../common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../common/Tools/CommonTool";
import EventManager, { GameStateUpdate } from "../../../common/Tools/Base/EventManager";
import { IWindow } from "../../../common/Tools/PopupSystem/IWindow";
import PopupManager from "../../../common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../common/Tools/PopupSystem/PopupConfig";
import ScrollLazyLoader from "../../../common/Tools/Scroll/ScrollLazyLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ConfirmPurchasePage extends MegaComponent implements IWindow {

    @property({ type: cc.Node, visible: true })
    private Node_Modal: cc.Node = null;
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_ConfirmedCardList: ScrollLazyLoader = null;
    @property({ type: cc.Node, visible: true })
    private Btn_ChangeCard: cc.Node = null;
    // 列表資訊
    @property({ type: cc.Label, visible: true })
    private Label_cardType: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_gameType: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_cardsPrice: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_cardCount: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_totalAmount: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Btn_cancel: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Btn_confirm: cc.Node = null;

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_CardResetResponse, this.OnCardResetResponse, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener(); 
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_CardResetResponse, this.OnCardResetResponse, this);    
    }

    protected init(): void {
        super.init();
        this.Btn_ChangeCard.on('click', this.OnChangeCard, this);
        this.Btn_cancel.on('click', this.OnCancel, this);
        this.Btn_confirm.on('click', this.OnConfirm, this);
        this.node.active = false;
    }

    open(data : any): void {
        if(this.data == null)
            this.init();
        this.node.active = true;
        this.ScrollView_ConfirmedCardList.scrollToTop();
        this.setPageState();
    }
    close(): void {
        this.node.active = false;
        PopupManager.closePopup(PopupName.ConfirmPurchasePage);
    }

    /** 發送重置目前卡片內容 */
    private OnChangeCard() {
        // ** 播放卡片選轉動畫 **
        this.data.SnedChangeCardData();
    }

    /** 重置目前卡片內容回包 */
    private OnCardResetResponse() {
        this.setConfirmPurchasePageData();
    }

    /** 關閉確認卡片頁面 */
    private OnCancel() {
        this.close();
    }

    /** 確定購買卡片 */
    private OnConfirm() {
        this.close();
        this.data.SendPurchasedCardList();
    }

    /** 變更確認頁面的內容 */
    protected setPageState() {
        let d = this.data.getConfirmPurchasePageData();
        this.setConfirmPurchasePageData();
        // 設定參數
        this.Btn_ChangeCard.active = !d.isDIYType;
        CommonTool.setLabel(this.Label_cardType, d.cardTypeStr);
        CommonTool.setLabel(this.Label_gameType, d.gameTypeStr);
        CommonTool.setLabel(this.Label_cardsPrice, d.cardsPriceStr);
        CommonTool.setLabel(this.Label_cardCount, d.numberOfCardStr);
        CommonTool.setLabel(this.Label_totalAmount, d.totalAmountStr);
    }

    /** 設定確認購卡頁面的卡片內容 */
    private setConfirmPurchasePageData() {
        let ConfirmedCardPurchase = this.data.getConfirmedCardPurchaseList();
        this.ScrollView_ConfirmedCardList.refreshData(ConfirmedCardPurchase);
    }
}

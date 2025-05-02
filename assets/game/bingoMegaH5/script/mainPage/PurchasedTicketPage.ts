import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/EventManager/EventManager";
import BallPrize from "../component/BallPrize";
import ScrollLazyLoader from "../component/ScrollLazyLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PurchasedTicketPage extends MegaComponent {
    @property({ type: cc.Node, visible: true })
    private Group_PrizeOverview: cc.Node = null;
    private BallPrizes : BallPrize[] = [];
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_CardGroup: ScrollLazyLoader = null;
    @property({ type: cc.Node, visible: true })
    private Btn_AddCard: cc.Node = null;
    @property({ type: [cc.Node], visible: true })
    private Btn_PreBuyCard: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_TotaiWin: cc.Node = null;
    @property({ type: cc.Label, visible: true })
    private Label_totaiWin: cc.Label = null;

    protected addEventListener(): void {
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendBall, this.updatePage, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage, this.showAction, this);
    }

    protected removeEventListener(): void {
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SendBall, this.updatePage, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage, this.showAction, this);
    }

    protected init(): void {
        super.init();
        this.BallPrizes = this.Group_PrizeOverview.getComponentsInChildren(BallPrize);
        this.Btn_AddCard.on('click', this.OpenCardPurchasePage, this);
        this.Btn_PreBuyCard.on('click', this.OpenCardPurchasePage, this);
        this.node.active = false;
    }

    /** 開啟購卡介面 */
    private OpenCardPurchasePage() {
        console.log("開啟購卡介面");
    }

    /** 展示頁面 */
    public showAction() {
        this.node.active = true;
        this.ScrollView_CardGroup.scrollToTop();
        this.setPageState();
    }

    /** 更新確認頁面的內容 */
    public setPageState() {
        let d = this.data.getPurchasedTicketPageData();

        let cardData = this.data.getPurchasedCardList();
        this.ScrollView_CardGroup.refreshData(cardData);

        // 底部欄位展示內容( 0:可以購買當局卡,1:可以購買預購卡,2顯示已經中獎金額,3:不展示 )
        let BottomBtnState = d.BottomBtnState;
        this.Btn_AddCard.active = (BottomBtnState == 0) ? true : false;
        this.Btn_PreBuyCard.active = (BottomBtnState == 1) ? true : false;
        this.Node_TotaiWin.active = (BottomBtnState == 2) ? true : false;
        CommonTool.setLabel(this.Label_totaiWin, d.totalWin);
    }

    /** 更新卡片與中獎狀態 */
    public updatePage() {
        this.setPageState();
    }
}

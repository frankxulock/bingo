import prizeData, { GAME_STATUS } from "../../Common/Base/CommonData";
import MegaComponent from "../../Common/Base/gameMega/MegaComponent";
import CardPurchasePage from "./mainPage/CardPurchasePage";
import PurchasedTicketPage from "./mainPage/PurchasedTicketPage";

const {ccclass, property} = cc._decorator;

/*** 公用圖片與資訊設定管理處 */
@ccclass
export default class BingoMegaUI extends MegaComponent {

    @property({ type: [cc.SpriteFrame], visible: true })
    private ballBG: cc.SpriteFrame[] = [];
    @property({ type: [prizeData], visible: true })
    protected prizeDataList : prizeData[] = []; // 中獎圖示資料
    @property({ type: cc.SpriteFrame, visible: true })
    protected cardUncheckedBG : cc.SpriteFrame = null; 
    @property({ type: cc.SpriteFrame, visible: true })
    protected cardCheckedBG : cc.SpriteFrame = null; 
    
    @property({ type: cc.Node, visible: true })
    protected Obj_CardPurchasePage : cc.Node = null; 
    @property({ type: cc.Node, visible: true })
    protected Obj_PurchasedTicketPage : cc.Node = null; 
    private CardPurchase : CardPurchasePage = null;
    private PurchasedTicket : PurchasedTicketPage = null;

    protected init(): void {
        super.init();
        let data = {
            ballBG : this.ballBG,
            prizeDataList : this.prizeDataList,
            cardUncheckedBG : this.cardUncheckedBG,
            cardCheckedBG : this.cardCheckedBG,
        }
        this.data.setInitData(data);
        this.CardPurchase = this.Obj_CardPurchasePage.getComponent(CardPurchasePage);
        this.PurchasedTicket = this.Obj_PurchasedTicketPage.getComponent(PurchasedTicketPage);
    }

    // 快照事件（恢復遊戲狀態）
    public State_Snapshot(): void {
        // console.log("快照事件（恢復遊戲狀態）");
        this.showCardPurchasePage(this.data.showCardPurchasePage());
    }
    
    /** 加載遊戲資源 */
    public State_Loading(): void {
        // console.log("加載遊戲資源");
    }

    /** 購卡時間 */
    public State_Buy(): void {
        // console.log("購卡時間");
        this.showCardPurchasePage(this.data.showCardPurchasePage());
    }

    /** 開球時間 */
    public State_Drawthenumbers(): void {
        // console.log("開球時間");
        this.showCardPurchasePage(this.data.showCardPurchasePage());
    }

    /** 開獎時間 */
    public State_Reward(): void {
        // console.log("開獎時間");
        this.showCardPurchasePage(this.data.showCardPurchasePage());
    }

    /** 是否展示購卡頁面或是已購卡頁面 */
    private showCardPurchasePage(isCardPurchasePage : boolean) {
        this.Obj_CardPurchasePage.active = isCardPurchasePage;
        this.Obj_PurchasedTicketPage.active = !isCardPurchasePage;
        (isCardPurchasePage ? this.CardPurchase : this.PurchasedTicket).setPageState();
    }
}
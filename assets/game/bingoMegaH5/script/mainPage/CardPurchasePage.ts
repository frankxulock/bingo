import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import ToastManager from "../../../Common/Tools/Toast/ToastManager";
import ChipItem from "../component/ChipItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CardPurchasePage extends MegaComponent {
    @property({ type: cc.Node, visible: true })
    private Btn_MyFavCards: cc.Node = null;
    @property({ type: cc.ToggleContainer, visible: true })
    private Toggle_PlayState : cc.ToggleContainer = null;
    @property({ type: cc.Label, visible: true })
    private Label_CardPrice : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_Currency : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_UserManual : cc.Label = null;
    @property({ type: cc.ToggleContainer, visible: true })
    private Toggle_BettingChipList : cc.ToggleContainer = null;

    @property({ type: cc.Node, visible: true })
    private Btn_Increase : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Btn_Decrease : cc.Node = null;
    @property({ type: cc.Label, visible: true })
    private Label_CardValue : cc.Label = null;

    @property({ type: cc.Label, visible: true })
    private Label_TotalAmount : cc.Label = null;

    @property({ type: cc.Node, visible: true })
    private Btn_BuyCard : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Btn_PreBuyCard : cc.Node = null;
    
    protected init(): void {
        super.init();
        this.Btn_MyFavCards.on('click', this.OpenDIYWindow, this);
        this.Toggle_PlayState.toggleItems.forEach((toggle, index) => {
            toggle.node.on('toggle', () => {
                this.data.setPlayState(index);
                this.setPageState();
            }, this);
        });
        this.Toggle_BettingChipList.toggleItems.forEach((toggle, index) => {
            toggle.node.on('toggle', () => {
                this.data.setCurChipIndex(index);
                this.changeCardInfo();
            }, this);
        });
        this.Btn_Increase.on('click', this.OnIncrease, this);
        this.Btn_Decrease.on('click', this.OnDecrease, this);
        this.Btn_BuyCard.on('click', this.OpenConfirmPurchasePage, this);
        this.Btn_PreBuyCard.on('click', this.OpenConfirmPurchasePage, this);
        this.node.active = false;
    }

    /** 開啟DIY購卡頁面 */
    private OpenDIYWindow() {
        this.data.OpenDIYEvent();
    }

    /** 增加購卡數量 */
    private OnIncrease() {
        this.data.ChangeReadyBuyValue(1);
        this.changeCardInfo();
    }

    /** 減少購卡數量 */
    private OnDecrease() {
        this.data.ChangeReadyBuyValue(-1);
        this.changeCardInfo();
    }

    /** 開啟確認買卡片頁面 */
    private OpenConfirmPurchasePage() {    
        if(this.data.getReadyBuy() == 0) {
            ToastManager.instance.show("購買卡片數量不能為 0");
            return;
        }
        if(this.data.getBuyCardButtonAvailability() == false){
            ToastManager.instance.show("已經發送事件給Server.尚未收到回包請等待");
            return;
        }

        // 先發給數據層之後再將數據與通知層拆分
        this.data.SendConfirmPurchase();
    }

    /** 更新下注頁面的狀態內容 */
    public setPageState() {
        let d = this.data.getCardPurchasePageData();
        // 設置頁面
        this.Toggle_PlayState.toggleItems[d.playState].isChecked = true;
        this.Label_CardPrice.node.active = d.playJackpot;
        this.Label_Currency.node.active = !d.playJackpot;
        this.Label_UserManual.node.active = d.playCombo;
        this.Toggle_BettingChipList.node.active = !d.playJackpot;
        if(d.chipList) {
            // 設置籌碼列表
            this.Toggle_BettingChipList.toggleItems.forEach((toggle, index) => {
                let chipItem = toggle.getComponent(ChipItem);
                // 設置籌碼金額
                chipItem.setChipAmount(d.chipList[index]);
                if(index == d.curChipIndex) {
                    toggle.isChecked = true;
                }
            });
        }

        this.CheckShowBtn();
        this.changeCardInfo();
    }

    /** 局部資訊變更 如 : 更改籌碼 購卡數量等等 */
    public changeCardInfo() {
        let readyBuy = this.data.getReadyBuy();
        CommonTool.setLabel(this.Label_CardValue, readyBuy);
        CommonTool.setLabel(this.Label_TotalAmount, this.data.getBuyTotalCard());
        this.Btn_Decrease.active = (readyBuy != 0);
    }

    /** 檢查要展示的按鈕類型 */
    public CheckShowBtn() {
        let buyCardThisRound = this.data.buyCardThisRound();
        this.Btn_BuyCard.active = buyCardThisRound;
        this.Btn_PreBuyCard.active = !buyCardThisRound;
    }
}

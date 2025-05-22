import { CARD_STATUS } from "../../../Common/Base/CommonData";
import ChipItem from "../../../Common/Base/component/ChipItem";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import ToastManager from "../../../Common/Tools/Toast/ToastManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CardPurchasePage extends MegaComponent {
    @property({ type: cc.ToggleContainer, visible: true })
    private Toggle_CardState: cc.ToggleContainer = null;
    @property({ type: cc.ToggleContainer, visible: true })
    private Toggle_PlayState : cc.ToggleContainer = null;
    @property({ type: cc.Node, visible: true })
    private Node_Currency : cc.Node = null;
    @property({ type: cc.Label, visible: true })
    private Label_CardPrice : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_Currency : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_UserManual : cc.Label = null;
    @property({ type: cc.ToggleContainer, visible: true })
    private Toggle_BettingChipList : cc.ToggleContainer = null;

    @property({ type: cc.Node, visible: true })
    private Btn_OpenDIYPage : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Btn_Increase : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Btn_Decrease : cc.Node = null;
    @property({ type: cc.EditBox, visible: true })
    private EditBox_Card : cc.EditBox = null;
    @property({ type: cc.Label, visible: true })
    private Label_TotalAmount : cc.Label = null;

    @property({ type: cc.Node, visible: true })
    private Btn_BuyCard : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Btn_PreBuyCard : cc.Node = null;

    private pressIndex: number = 0;
    // 記錄長按持續時間與間隔
    private pressTimeout: number = 0; 
    private pressInterval: number = 0.1; // 長按持續調用間隔 (秒)

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateEvent.GAME_BUY, this.onSnapshot, this);
        EventManager.getInstance().on(GameStateEvent.GAME_DRAWTHENUMBERS, this.onSnapshot, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_CardPurchasePage, this.setPageState, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateEvent.GAME_BUY, this.onSnapshot, this);
        EventManager.getInstance().off(GameStateEvent.GAME_DRAWTHENUMBERS, this.onSnapshot, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_CardPurchasePage, this.setPageState, this);
    }

    protected init(): void {
        super.init();

        // 卡片選擇方式切換 (DIY / 亂數)
        this.Toggle_CardState.toggleItems.forEach((toggle, index) => {
            toggle.node.on('toggle', () => {
                // 設定是DIY還是亂數選卡
                this.data.setCardContent(index);
                this.changeCardInfo();
                if(index == 1 && this.data.CheckOpenDIYCardSelectionPage()) {
                    // 檢查是否已經選購DIY卡片,沒有則開啟DIY選卡頁面
                    this.OpenDIYCardSelectionPage();
                };
                this.EditBox_Card.enabled = (index == 0);
            }, this);
        });

        // 遊戲玩法切換 (當局 / 預購)
        this.Toggle_PlayState.toggleItems.forEach((toggle, index) => {
            toggle.node.on('toggle', () => {
                this.data.setPlayState(index);
                this.setPageState();
            }, this);
        });

        // 籌碼選擇
        this.Toggle_BettingChipList.toggleItems.forEach((toggle, index) => {
            toggle.node.on('toggle', () => {
                this.data.setCurChipIndex(index);
                this.changeCardInfo();
            }, this);
        });

        this.EditBox_Card.node.on('editing-did-ended', this.onTextChanged, this);

        // 增加 / 減少購買數量
        this.Btn_Increase.on('click', this.OnIncrease, this);
        this.Btn_Decrease.on('click', this.OnDecrease, this);
        this.Btn_OpenDIYPage.on('click', this.OpenDIYCardSelectionPage, this);

        // 購買按鈕
        this.Btn_BuyCard.on('click', this.OnBuyCard, this);
        this.Btn_PreBuyCard.on('click', this.OnBtnPreBuyCard, this);

        // 設置長按事件
        this.setupButtonHoldEvent();
    }

    /** 開啟DIY選購頁面 */
    private OpenDIYCardSelectionPage() {
        PopupManager.showPopup(PopupName.DIYCardSelectionPage, this.data.getDIYCardSelectionPageData());
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

    /** 編輯數量 */
    onTextChanged(editBox: cc.EditBox) {
        let str = editBox.string;
        // 取得最大可輸入的卡數
        let maxCard = this.data.getMaxCardCount();
    
        // 過濾非數字
        let filtered = str.replace(/[^0-9]/g, '');
    
        // 限制最大值
        let num = parseInt(filtered || '0', 10);
    
        // 避免超過最大數值，並確保最小值為 1
        num = Math.max(1, Math.min(maxCard, num));
    
        // 更新 EditBox 顯示內容
        if (editBox.string !== num.toString()) {
            editBox.string = num.toString();
        }
        this.data.setReadyBuy(num);
        this.changeCardInfo();
    }

    /** 購買正常卡 */
    private OnBuyCard() {
        this.data.setCardState(CARD_STATUS.NORMAL);
        this.OpenConfirmPurchasePage();
    }

    /** 購買預購卡 */
    private OnBtnPreBuyCard() {
        this.data.setCardState(CARD_STATUS.PREORDER);
        this.OpenConfirmPurchasePage();
    }

    /** 開啟確認買卡片頁面 */
    protected OpenConfirmPurchasePage(): boolean {
        if(this.data.getCardsToBuy() == 0){
            ToastManager.showToast("卡片數量不能為空");
            return false;
        }

        if ((this.data.getCoin() - this.data.getBuyTotalCard()) < 0) {
            ToastManager.showToast("余额不足");
            return false;
        }

        if (this.data.CheckOpenDIYCardSelectionPage() && this.Toggle_CardState.toggleItems[1].isChecked) {
            this.OpenDIYCardSelectionPage();
            return false;
        }

        this.data.SendConfirmPurchase();
        return true; // 表示成功執行，可以進一步動作
    }

    /** 快照恢復 */
    protected onSnapshot(): void {
        this.node.active = this.data.showCardPurchasePage();
        this.setPageState();
    }

    /** 遊戲結束事件 重置目前內容 */
    protected onGameOver(): void {
        this.onSnapshot();
    }

    /** 更新下注頁面的狀態內容 */
    public setPageState() {
        const data = this.data.getCardPurchasePageData();

        // 設定目前卡片狀態的 Toggle 為勾選
        this.Toggle_CardState.toggleItems[data.cardContent].isChecked = true;
        // 設定目前玩法狀態的 Toggle 為勾選
        this.Toggle_PlayState.toggleItems[data.playState].isChecked = true;

        // 根據是否為 Jackpot 模式，切換顯示的 UI 標籤
        this.Node_Currency.active = data.playJackpot;
        this.Label_CardPrice.node.active = data.playJackpot;   // 顯示卡片價格（Jackpot 模式）
        this.Label_Currency.node.active = !data.playJackpot;   // 顯示一般貨幣（非 Jackpot 模式）
        // 若為連線玩法，顯示使用說明
        this.Label_UserManual.node.active = data.playCombo;
        // 若非 Jackpot 模式，顯示籌碼選項列表
        this.Toggle_BettingChipList.node.active = !data.playJackpot;
        // 設定籌碼列表內容與選中狀態
        if (data.chipList) {
            this.Toggle_BettingChipList.toggleItems.forEach((toggle, index) => {
                if(data.chipList.length > index) {
                    toggle.node.active = true;
                    const chipItem = toggle.getComponent(ChipItem);
                    // 設定籌碼金額
                    chipItem.setChipAmount(data.chipList[index]);
                    // 設定當前選中的籌碼
                    toggle.isChecked = (index === data.curChipIndex);
                    toggle.interactable = (data.multiples == 0) ? true : false;
                }else {
                    toggle.node.active = false;
                }
            });
        }

        // 顯示/隱藏按鈕狀態檢查
        this.CheckShowBtn();
        // 更新卡片資訊顯示
        this.changeCardInfo();
    }

    /** 局部資訊變更 如 : 更改籌碼 購卡數量等等 */
    public changeCardInfo() {
        let readyBuy = this.data.getCardsToBuy();
        this.EditBox_Card.string = readyBuy.toString();
        CommonTool.setLabel(this.Label_TotalAmount, CommonTool.formatNumber(this.data.getBuyTotalCard()));

        let buyDIYCard = this.data.buyDIYCard();
        this.Btn_Increase.active = this.Btn_Decrease.active = !buyDIYCard;
        this.Btn_OpenDIYPage.active = buyDIYCard;

        // 更新所有卡片狀態的外觀顯示（選中的顯示樣式不同）
        this.Toggle_CardState.toggleItems.forEach((toggle, index) => {
            // 第一個子節點為選中標記或樣式切換節點
            toggle.node.children[0].active = !toggle.isChecked;
        });
    }

    /** 檢查要展示的按鈕類型 */
    public CheckShowBtn() {
        let buyCardThisRound = this.data.GameState_BUY();
        this.Btn_BuyCard.active = buyCardThisRound;
        this.Btn_PreBuyCard.active = !buyCardThisRound;
    }

    private index = 0;

    /** 設置長按事件 */
    private setupButtonHoldEvent() {
        this.Btn_Increase.on('touchstart', this.onButtonHoldStart, this);
        this.Btn_Decrease.on('touchstart', this.onButtonHoldStart, this);
        this.Btn_Increase.on('touchend', this.onButtonHoldEnd, this);
        this.Btn_Decrease.on('touchend', this.onButtonHoldEnd, this);
        this.Btn_Increase.on('touchcancel', this.onButtonHoldEnd, this);
        this.Btn_Decrease.on('touchcancel', this.onButtonHoldEnd, this);
    }

    /** 當按鈕被長按時開始調用 */
    private onButtonHoldStart(event: cc.Event.EventTouch) {
        this.pressTimeout = 0;
        this.pressInterval = 0.1; 
        this.schedule(this.onHoldUpdate, this.pressInterval); // 每個間隔調用一次
        if(event.target.name == "Btn_Increase") {
            this.pressIndex = 1;
        }else if(event.target.name == "Btn_Decrease") {
            this. pressIndex = 2;
        }
    }

    /** 當按鈕長按結束時停止調用 */
    private onButtonHoldEnd(event: cc.Event.EventTouch) {
        this.unschedule(this.onHoldUpdate); // 停止調用
        this. pressIndex = 0;
    }

    /** 每次更新長按邏輯 */
    private onHoldUpdate() {
        this.pressTimeout += this.pressInterval;
        if(this.pressTimeout == 0.5){
            this.pressInterval = 0.01; 
            this.unschedule(this.onHoldUpdate); // 停止調用
            this.schedule(this.onHoldUpdate, this.pressInterval); // 每個間隔調用一次
        }
        // 持續調用的邏輯
        if (this.pressIndex == 1) {
            this.OnIncrease();
        } else if (this.pressIndex == 2) {
            this.OnDecrease();
        }
    }
}

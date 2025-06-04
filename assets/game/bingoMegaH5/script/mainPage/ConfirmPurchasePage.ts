import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import ScrollLazyLoader from "../../../Common/Tools/Scroll/ScrollLazyLoader";
import Card from "../component/Card/Card";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../../Common/Tools/Base/EventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ConfirmPurchasePage extends MegaComponent implements IWindow {

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

    private ChangeCardAnim : boolean = false;

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateEvent.GAME_DRAWTHENUMBERS, this.ChangeGameType, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateEvent.GAME_DRAWTHENUMBERS, this.ChangeGameType, this);   
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

    /** 變更遊戲類型通知 
     * 用於玩家在下注狀態購買正常卡的時候通知將換成預購卡
    */
    private ChangeGameType() {
        PopupManager.showPopup(PopupName.PurchaseUpdatePage);
       this.setPageState();
    }

    protected onNewGame(){
        this.setPageState();
    }

    /** 發送重置目前卡片內容，並播放卡片翻轉動畫更新資料 */
    private OnChangeCard() {
        // 檢查是否播放按鈕中
        if(this.ChangeCardAnim)
            return;
        this.ChangeCardAnim = true;

        // 1. 呼叫資料層，取得新一輪卡片資料（假設回傳陣列，每個資料物件有 getID 方法）
        const newDataList = this.data.SnedChangeCardData();

        // 2. 更新 ScrollView 預設資料狀態（這可能會觸發卡片渲染或預設樣式）
        this.ScrollView_ConfirmedCardList.UpdateData(newDataList);

        const content = this.ScrollView_ConfirmedCardList.content;
        const layout = content.getComponent(cc.Layout);

        // 3. 停用 Layout，自定義動畫過程不受自動排版干擾
        layout.enabled = false;

        // 4. 對每個卡片節點進行動畫與資料更新處理
        content.children.forEach((cardNode: cc.Node, index: number) => {
            const cardComp = cardNode.getComponent(Card);
            if (!cardComp) return;

            // 根據卡片原有 ID，尋找對應的新資料
            const cardID = cardComp.data.getID();
            const newCardData = newDataList.find(data => data.getID() === cardID);

            if (!newCardData) {
                console.warn("找不到對應卡片資料", cardID);
                return;
            }

            // 5. 建立卡片翻轉動畫流程
            const tween = cc.tween(cardNode)
                .to(0.2, {scaleX: 0})
                .call(() => {
                    cardComp.setData(newCardData); // 在卡片正面時替換資料
                })
                .to(0.2, { scaleX: 0.675 });

            // 6. 如果是最後一張卡片，加入動畫結束回調
            if (index === content.children.length - 1) {
                tween.call(() => {
                    layout.enabled = true; // 恢復 Layout 自動排版
                    this.ChangeCardAnim = false;
                });
            }
            tween.start(); // 開始動畫
        });
    }

    /** 關閉確認卡片頁面 */
    private OnCancel() {
        // 停止卡片 ScrollView 裡所有節點上的 tween
        const content = this.ScrollView_ConfirmedCardList.content;
        content.children.forEach((node) => {
            cc.Tween.stopAllByTarget(node);
        });
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

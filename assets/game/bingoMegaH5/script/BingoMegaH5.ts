import MegaComponent from "../../Common/Base/gameMega/MegaComponent";
import { SocketManager } from "../../Common/Base/SocketManager";
import { audioManager } from "../../Common/Tools/AudioMgr";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../Common/Tools/Base/EventManager";
import { PopupName } from "../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../Common/Tools/PopupSystem/PopupManager";
import { UrlManager } from "../../Common/Tools/UrlManager";


/*** 與其他操作系統處理處 */
const {ccclass, property} = cc._decorator;
@ccclass
export default class BingoMegaH5 extends MegaComponent {

    private initialized : boolean = false;
    private initStart: boolean = false;
    @property({ type: cc.Node, visible: true })
    private NewGame : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private ExtraTime : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private BingoTime : cc.Node = null;

    /** 監聽事件（後期根據不同遊戲複寫） */
    protected addEventListener() {
        super.addEventListener();
        cc.game.on(cc.game.EVENT_SHOW, () => { audioManager.setHtmlFocus(true); }, this);
        cc.game.on(cc.game.EVENT_HIDE, () => { audioManager.setHtmlFocus(false); }, this);
        EventManager.getInstance().on(GameStateEvent.GAME_BUY, this.onNewGame, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_ExtralTime, this.onExtraTime, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_BingoTime, this.onBingoTime, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_OpenDIYEditPage, this.OpneDIYEditPage, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_DIYConfirmPurchase, this.DIYConfirmPurchase, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SaveDIYCards, this.SaveDIYCards, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_DeleteDIYCard, this.DeleteDIYCard, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendChatMessage, this.SendChat, this);
        cc.director.getScene().on("Game:InitData", this.onReceiveInitData, this);
    }

    /** 監聽事件註銷（後期根據不同遊戲複寫） */
    protected removeEventListener() {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateEvent.GAME_BUY, this.onNewGame, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_ExtralTime, this.onExtraTime, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_BingoTime, this.onBingoTime, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_OpenDIYEditPage, this.OpneDIYEditPage, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_DIYConfirmPurchase, this.DIYConfirmPurchase, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SaveDIYCards, this.SaveDIYCards, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_DeleteDIYCard, this.DeleteDIYCard, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SendChatMessage, this.SendChat, this);
    }

    /** 初始化各種註冊流程（後期根據不同遊戲複寫） */
    protected init(): void {
        super.init();
        audioManager.init({bgmVolume : 1, soundVolume : 1});
        audioManager.setNode();
    }

    protected start(): void {
        this.initStart = true;
        this.onReceiveInitData();
    }

    onNewGame() {
        // 頁面在前台（可見）
        if (document.visibilityState === "visible")
            this.NewGame.active = true;
    }

    onExtraTime() {
        // 頁面在前台（可見）
        if (document.visibilityState === "visible")
            this.ExtraTime.active = true;
    }

    onBingoTime() {
        // 頁面在前台（可見）
        if (document.visibilityState === "visible")
            this.BingoTime.active = true;
    }

    private onReceiveInitData() {
        // 避免初始化執行兩次 快照更新
        if (!this.initialized && this.initStart && (window.serverData && Object.keys(window.serverData).length > 0)) {
            this.data.init();
            const socket = SocketManager.getInstance();
            socket.connect("wss://bg-nats.vipsroom.net/");
            this.initialized = true;
        }
    }

    /** 開啟DIY編輯頁面 */
    private OpneDIYEditPage(data) {
        this.data.OpenDIYEditCard(data);
    }

    /** DIY選購卡片完畢事件 */
    private DIYConfirmPurchase(data) {
        this.data.DIYConfirmPurchase(data);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_CardPurchasePage);
    }

    /** 儲存玩家編輯完畢的DIY卡片資訊 */
    private SaveDIYCards(data) {
        // console.log("儲存DIY卡片  可能需要Server請求參數等等事件先保留")
        this.data.DIYCardEditUpdate(data);
        this.data.SendDIYCardSelectionPage(false);
    }

    /** DIY刪除卡片事件 */
    private DeleteDIYCard(data) {
        this.data.DIYDelete(data);
        this.data.SendDIYCardSelectionPage(false);
    }

    /** 發送聊天訊息 */
    private SendChat(message : string) {
        let newMessage = this.data.SendChat(message);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_ReceiveChatMessage, newMessage);
    }
}

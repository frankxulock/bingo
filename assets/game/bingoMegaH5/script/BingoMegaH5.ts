import MegaComponent from "../../Common/Base/gameMega/MegaComponent";
import { audioManager } from "../../Common/Tools/AudioMgr";
import EventManager, { GameStateUpdate } from "../../Common/Tools/Base/EventManager";
import { PopupName } from "../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../Common/Tools/PopupSystem/PopupManager";
import { UrlManager } from "../../Common/Tools/UrlManager";


/*** 與其他操作系統處理處 */
const {ccclass, property} = cc._decorator;
@ccclass
export default class BingoMegaH5 extends MegaComponent {

    private initialized : boolean = false;
    private initStart: boolean = false;

    /** 監聽事件（後期根據不同遊戲複寫） */
    protected addEventListener() {
        super.addEventListener();
        cc.game.on(cc.game.EVENT_SHOW, () => { audioManager.setHtmlFocus(true); }, this);
        cc.game.on(cc.game.EVENT_HIDE, () => { audioManager.setHtmlFocus(false); }, this);
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
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_OpenDIYEditPage, this.OpneDIYEditPage, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_DIYConfirmPurchase, this.DIYConfirmPurchase, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SaveDIYCards, this.SaveDIYCards, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_DeleteDIYCard, this.DeleteDIYCard, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendChatMessage, this.SendChat, this);
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

    private onReceiveInitData() {
        // 避免初始化執行兩次 快照更新
        if (!this.initialized && this.initStart && (window.serverData && Object.keys(window.serverData).length > 0)) {
            this.data.init();
            this.initialized = true;
        }
    }

    /** 開啟DIY編輯頁面 */
    private OpneDIYEditPage(data) {
        this.data.setDIYEditCard(data);
        // console.log("開啟DIY編輯頁面  可能需要Server請求參數等等事件先保留")
        PopupManager.showPopup(PopupName.DIYEditPage, this.data.getDIYEditPageData());
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
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_DIYCardSelectionPage, this.data.getDIYCardSelectionData());
    }

    /** DIY刪除卡片事件 */
    private DeleteDIYCard(data) {
        this.data.DIYDelete(data);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_DIYCardSelectionPage, this.data.getDIYCardSelectionData());
    }

    /** 發送聊天訊息 */
    private SendChat(message : string) {
        let newMessage = this.data.SendChat(message);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_ReceiveChatMessage, newMessage);
    }
}

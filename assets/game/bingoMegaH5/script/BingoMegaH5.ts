import { audioManager } from "../../Common/Tools/AudioMgr";
import EventManager, { GameStateEvent } from "../../Common/Tools/EventManager/EventManager";
import { UrlManager } from "../../Common/Tools/UrlManager";
import MegaComponent from "../../Common/Base/gameMega/MegaComponent";
import BingoMegaUI from "./BingoMegaUI";

/*** 與其他操作系統處理處 */
const {ccclass, property} = cc._decorator;
@ccclass
export default class BingoMegaH5 extends MegaComponent {
    @property({ type: BingoMegaUI, visible: true })
    private ui : BingoMegaUI = null;

    /** 監聽事件（後期根據不同遊戲複寫） */
    protected addEventListener() {
        super.addEventListener();
        cc.game.on(cc.game.EVENT_SHOW, () => { audioManager.setHtmlFocus(true); }, this);
        cc.game.on(cc.game.EVENT_HIDE, () => { audioManager.setHtmlFocus(false); }, this);
        EventManager.getInstance().on(GameStateEvent.GAME_LOADING, this.GameState_LOADING, this);
        EventManager.getInstance().on(GameStateEvent.GAME_BUY, this.GameState_BUY, this);
        EventManager.getInstance().on(GameStateEvent.GAME_DRAWTHENUMBERS, this.GameState_DRAWTHENUMBERS, this);
        EventManager.getInstance().on(GameStateEvent.GAME_REWARD, this.GameState_REWARD, this);
    }

    /** 監聽事件註銷（後期根據不同遊戲複寫） */
    protected removeEventListener() {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateEvent.GAME_LOADING, this.GameState_LOADING(), this);
        EventManager.getInstance().off(GameStateEvent.GAME_BUY, this.GameState_BUY(), this);
        EventManager.getInstance().off(GameStateEvent.GAME_DRAWTHENUMBERS, this.GameState_DRAWTHENUMBERS(), this);
        EventManager.getInstance().off(GameStateEvent.GAME_REWARD, this.GameState_REWARD(), this);
    }

    /** 初始化各種註冊流程（後期根據不同遊戲複寫） */
    protected init(): void {
        super.init();
        this.data.DefaultData();
        this.data.gameID = Number(UrlManager.getGameID());
        audioManager.init({bgmVolume : 1, soundVolume : 1});
        audioManager.setNode();
    }

    //#region 遊戲狀態事件

    // 快照事件（恢復遊戲狀態）
    protected onSnapshot(): void {
        this.ui.State_Snapshot();
    }
    
    /** 加載遊戲資源 */
    protected GameState_LOADING(): void {
        this.ui.State_Loading();
    }

    /** 購卡時間 */
    protected GameState_BUY(): void {
        this.ui.State_Buy();
    }

    /** 開球時間 */
    protected GameState_DRAWTHENUMBERS(): void {
        this.ui.State_Drawthenumbers();
    }

    /** 開獎時間 */
    protected GameState_REWARD(): void {
        this.ui.State_Reward();
    }
    //#endregion
}

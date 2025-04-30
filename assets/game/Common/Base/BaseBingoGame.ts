import SocketManager from "./BingoSocketManager";
import BaseBingoUI from "./BaseBingoUI";
import DataManager from "./BingoData";
import { UrlManager } from "../Tools/UrlManager";
import { audioManager } from "../Tools/AudioMgr";
import { GAME_STATUS, WEB_EVENT } from "./CommonData";
import EventManager, { GameStateEvent } from "../Tools/EventManager/EventManager";

// 賓果遊戲的Controller
const { ccclass, property } = cc._decorator;
@ccclass
export default class BaseBingoGame extends cc.Component {
    @property({type: BaseBingoUI, override: true})
    protected ui: BaseBingoUI = null;
    protected socket : SocketManager = null;
    protected data : DataManager = null;

    protected onLoad(): void {
        /** 註冊監聽事件 */
        this.addEventListener();
        /* 初始化流程 */
        this.init();
    }

    /** 監聽事件（後期根據不同遊戲複寫） */
    protected addEventListener() {
        // window.addEventListener(WEB_EVENT.START_GAME, async (data) => { this.snapshot(); })
        cc.game.on(cc.game.EVENT_SHOW, () => { audioManager.setHtmlFocus(true); }, this);
        cc.game.on(cc.game.EVENT_HIDE, () => { audioManager.setHtmlFocus(false); }, this);
        EventManager.getInstance().on(GameStateEvent.GAME_IDLE, this.GameState_IDLE, this);
        EventManager.getInstance().on(GameStateEvent.GAME_BUY, this.GameState_BUY, this);
        EventManager.getInstance().on(GameStateEvent.GAME_DRAWTHENUMBERS, this.GameState_DRAWTHENUMBERS, this);
        EventManager.getInstance().on(GameStateEvent.GAME_EXTRABALL, this.GameState_EXTRABALL, this);
        EventManager.getInstance().on(GameStateEvent.GAME_REWARD, this.GameState_REWARD, this);
    }

    /** 初始化各種註冊流程（後期根據不同遊戲複寫） */
    protected init(): void {
        this.socket = SocketManager.getInstance();
        this.data = DataManager.getInstance();
        this.data.gameID = Number(UrlManager.getGameID());
        this.ui.init();
        this.data.init();
        this.socket.init();
        audioManager.init({bgmVolume : 1, soundVolume : 1});
        audioManager.setNode();

        // 測試用代碼初始化強制快照
        this.snapshot();
    }

    // 快照事件（恢復遊戲狀態）
    protected snapshot(): void {
        console.log("快照事件（恢復遊戲狀態）");
        this.data.setGameState(GAME_STATUS.IDLE);
    }

    //#region 遊戲狀態事件

    /** 閒置狀態 */
    protected GameState_IDLE(): void {
        console.log("閒置狀態");
        this.data.setGameState(GAME_STATUS.BUY);
    }

    /** 購卡時間 */
    protected GameState_BUY(): void {
        console.log("購卡時間");
        this.data.setGameState(GAME_STATUS.DRAWTHENUMBERS);
    }

    /** 開球時間 */
    protected GameState_DRAWTHENUMBERS(): void {
        console.log("開球時間");
        this.data.setGameState(GAME_STATUS.EXTRABALL);
    }

    /** 額外球時間 */
    protected GameState_EXTRABALL(): void {
        console.log("額外球時間");
        this.data.setGameState(GAME_STATUS.REWARD);
    }

    /** 開獎時間 */
    protected GameState_REWARD(): void {
        console.log("開獎時間");
    }

    //#endregion

    protected onDisable(): void {
        // 遊戲結束
        this.removeEventListener();
    }

    /** 監聽事件註銷（後期根據不同遊戲複寫） */
    protected removeEventListener() {
        EventManager.getInstance().off(GameStateEvent.GAME_IDLE, this.GameState_IDLE(), this);
        EventManager.getInstance().off(GameStateEvent.GAME_BUY, this.GameState_BUY(), this);
        EventManager.getInstance().off(GameStateEvent.GAME_DRAWTHENUMBERS, this.GameState_DRAWTHENUMBERS(), this);
        EventManager.getInstance().off(GameStateEvent.GAME_EXTRABALL, this.GameState_EXTRABALL(), this);
        EventManager.getInstance().off(GameStateEvent.GAME_REWARD, this.GameState_REWARD(), this);
    }
}
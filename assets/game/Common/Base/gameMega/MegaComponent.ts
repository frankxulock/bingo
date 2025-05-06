import EventManager, { GameStateEvent } from "../../Tools/EventManager/EventManager";
import BaseComponent from "../BaseComponent";
import MegaDataManager from "./MegaDataManager";

// 賓果遊戲的Controller
const { ccclass, property } = cc._decorator;
@ccclass
export default class MegaComponent extends BaseComponent {

    /** 監聽事件（後期根據不同遊戲複寫） */
    protected addEventListener() {
        EventManager.getInstance().on(GameStateEvent.GAME_SNAPSHOT, this.onSnapshot, this);
        EventManager.getInstance().on(GameStateEvent.GAME_OVER, this.onGameOver, this);
    }

    /** 監聽事件註銷（後期根據不同遊戲複寫） */
    protected removeEventListener() {
        EventManager.getInstance().off(GameStateEvent.GAME_SNAPSHOT, this.onSnapshot, this);
        EventManager.getInstance().off(GameStateEvent.GAME_OVER, this.onGameOver, this);
    }

    /** 初始化各種註冊流程（後期根據不同遊戲複寫） */
    protected init(): void {
        this.data = MegaDataManager.getInstance();
    }

    /** 通用的狀態還原事件 */
    protected onSnapshot() { };
    /** 通用的狀態遊戲結束事件(內容重置) */
    protected onGameOver() { };
}
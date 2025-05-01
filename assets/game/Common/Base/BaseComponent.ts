import SocketManager from "./BingoSocketManager";

import MegaDataManager from "./gameMega/MegaDataManager";
import { UrlManager } from "../Tools/UrlManager";
import { audioManager } from "../Tools/AudioMgr";
import { GAME_STATUS, WEB_EVENT } from "./CommonData";
import EventManager, { GameStateEvent } from "../Tools/EventManager/EventManager";

// 賓果遊戲的Controller
const { ccclass, property } = cc._decorator;
@ccclass
export default class BaseUIComponent extends cc.Component {
    protected data : MegaDataManager = null;

    protected onLoad(): void {
        /** 註冊監聽事件 */
        this.addEventListener();
        /* 初始化流程 */
        this.init();
    }

    protected onDisable(): void {
        // 遊戲結束
        this.removeEventListener();
    }

    /** 監聽事件（後期根據不同遊戲複寫） */
    protected addEventListener() {}

    /** 監聽事件註銷（後期根據不同遊戲複寫） */
    protected removeEventListener() { }
    
    /** 初始化各種註冊流程（後期根據不同遊戲複寫） */
    protected init(): void { }
}
import { audioManager } from "../../Common/Tools/AudioMgr";
import EventManager, { GameStateEvent } from "../../Common/Tools/EventManager/EventManager";
import { UrlManager } from "../../Common/Tools/UrlManager";
import MegaComponent from "../../Common/Base/gameMega/MegaComponent";
import BingoMegaUI from "./BingoMegaUI";

/*** 與其他操作系統處理處 */
const {ccclass, property} = cc._decorator;
@ccclass
export default class BingoMegaH5 extends MegaComponent {
    /** 監聽事件（後期根據不同遊戲複寫） */
    protected addEventListener() {
        super.addEventListener();
        cc.game.on(cc.game.EVENT_SHOW, () => { audioManager.setHtmlFocus(true); }, this);
        cc.game.on(cc.game.EVENT_HIDE, () => { audioManager.setHtmlFocus(false); }, this);
    }

    /** 監聽事件註銷（後期根據不同遊戲複寫） */
    protected removeEventListener() {
        super.removeEventListener();
    }

    /** 初始化各種註冊流程（後期根據不同遊戲複寫） */
    protected init(): void {
        super.init();
        this.data.DefaultData();
        this.data.gameID = Number(UrlManager.getGameID());
        audioManager.init({bgmVolume : 1, soundVolume : 1});
        audioManager.setNode();
    }
}

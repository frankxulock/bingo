/**
 * Bingo Game Unit Test
 * 用於測試賓果遊戲各項功能的單元測試類別
 */

import { CardMega } from "./Common/Base/card/CardMega";
import { CARD_CONTENT, GAME_STATUS } from "./Common/Base/CommonData";
import FlvPlayer from "./Common/Base/component/FlvPlayer";
import MegaManager from "./Common/Base/gameMega/MegaManager";
import EventManager, { GameStateEvent, GameStateUpdate } from "./Common/Tools/Base/EventManager";
import { PopupName } from "./Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "./Common/Tools/PopupSystem/PopupManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UnitTest extends cc.Component {
    // UI 元件
    private btns: cc.Button[] = [];

    // 遊戲數據管理
    private data : MegaManager = null;

    // 單例模式實現
    private static _instance: UnitTest = null;
    public static get instance(): UnitTest {
        if (!this._instance) {
            cc.warn("UnitTest尚未初始化！");
        }
        return this._instance;
    }

    /**
     * 生命週期：載入時
     * 確保單例模式的實現
     */
    onLoad() {
        if (UnitTest._instance && UnitTest._instance !== this) {
            this.destroy();
            return;
        }
        UnitTest._instance = this;
    }

    /**
     * 生命週期：開始時
     * 初始化按鈕事件綁定
     */
    start() {
        this.data = MegaManager.getInstance();

        this.btns = this.node.getComponentsInChildren(cc.Button);
        
        const buttonEvents = [
            // { index: 0, handler: this.onSnapshot },
            // { index: 1, handler: this.onSendBall },
            // { index: 2, handler: this.SimulationData_OpenConfirm },
            // { index: 3, handler: this.testCardSimulationGeneration },
            // { index: 4, handler: this.startSimulation },
            // { index: 5, handler: this.TestMegaCard },
            // { index: 6, handler: this.TestMegaCardView },
            // { index: 7, handler: this.OpenResultPage },
            // { index: 8, handler: this.OpneRewardPopupPage },
            // { index: 9, handler: this.OpneDIYCardSelectionPage },
            // { index: 10, handler: this.OpneDIYEditPage },
            // { index: 11, handler: this.setAvatarData },
            // { index: 12, handler: this.setLeaderboardData },
            // { index: 13, handler: this.TestFlvPlayer },
            // { index: 14, handler: this.getHttpID }
        ];

        buttonEvents.forEach(({index, handler}) => {
            this.btns[index]?.node.on('click', handler, this);
        });
    }
    
}

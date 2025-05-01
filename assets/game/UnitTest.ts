import MegaDataManager from "./Common/Base/gameMega/MegaDataManager";
import EventManager, { GameStateUpdate } from "./Common/Tools/EventManager/EventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UnitTest extends cc.Component {

    private data;
    private btns = [];

    start () {
        this.data = MegaDataManager.getInstance();
        this.btns = this.node.getComponentsInChildren(cc.Button);
        // this.btns[0].node('click', this.onSnapshot, this)
        // this.btns[1].node('click', this.onSnapshot, this)
        // this.btns[2].node('click', this.onSnapshot, this)
        // this.btns[3].node('click', this.onSnapshot, this)
        this.btns[4].node.on('click', this.onSendBall, this)
    }

    // 模擬快照封包進入
    onSnapshot() {
        // EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SendBall, 1);
    }

    onSendBall() {
        /** 模擬Server參數並在DataManager處理完畢 (DataManager負責Server參數轉換成Client可用數值) */
        let data = {
            num : 15,
        }
        this.data.ServerToBallEvent(data);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SendBall);
    }
}

import BallComponent from "../../../common/Base/component/BallCompoent";
import MegaDataManager from "../../../common/Base/gameMega/MegaDataManager";
import EventManager, { GameStateUpdate } from "../../../common/Tools/Base/EventManager";
import { CommonTool } from "../../../common/Tools/CommonTool";
import { IWindow } from "../../../common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../common/Tools/PopupSystem/PopupManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AllBallNumbersPage extends cc.Component implements IWindow {

    @property({ type: cc.Node, visible: true })
    private Node_Ball: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_Ball2: cc.Node = null;
    private balls : BallComponent[] = null;
    @property({ type: cc.Label, visible: true })
    private Label_TableID: cc.Label = null;

    protected onLoad(): void {
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendBall, this.setPageState, this);
    }

    protected onDestroy(): void {
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendBall, this.setPageState, this);
    }

    open(data : any): void {
        if(this.balls == null) {
            let ball1 = this.Node_Ball.getComponentsInChildren(BallComponent);
            let ball2 = this.Node_Ball2.getComponentsInChildren(BallComponent);
            this.balls = [...ball1, ...ball2];
        }

        this.setPageState();
    }
    close(): void {
        PopupManager.closePopup(PopupName.AllBallNumbersPage);
    }

    /** 更新頁面內容 */
    setPageState() {
        let data = MegaDataManager.getInstance().getAllBallNumbersData();
        // 球號列表更新
        if(data.ballList == null) {
            // 沒有數值不展示任何內容
            this.balls.forEach((ball)=> { ball.setAction(false) });
        }else{
            this.balls.forEach((ball, index)=> {
                if((index < data.ballList.length)) {
                    ball.setAction(true);
                    ball.setBallNumber(data.ballList[index]);
                }else {
                    ball.setAction(false);
                }
            })
        }
        CommonTool.setLabel(this.Label_TableID, data.tableId);
    }
}

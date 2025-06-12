import BallComponent from "../../../Common/Base/component/BallCompoent";
import MegaManager from "../../../Common/Base/gameMega/MegaManager";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";

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
        EventManager.getInstance().on(GameStateEvent.GAME_BUY, this.newGame, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendBall, this.setPageState, this);
    }

    protected onDestroy(): void {
        EventManager.getInstance().off(GameStateEvent.GAME_BUY, this.newGame, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SendBall, this.setPageState, this);
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

    newGame() {
        this.balls.forEach((ball) => {
            ball.setAction(false);
            cc.Tween.stopAllByTarget(ball.node); // 停止所有動畫
            ball.node.opacity = 255; // 還原透明度
        });
        PopupManager.closePopup(PopupName.AllBallNumbersPage);
    }

    /** 更新頁面內容 */
    setPageState() {
        const data = MegaManager.getInstance().getAllBallNumbersPageData();
        if(!data)
            return;
        const latestBall = data.ballList?.[data.ballList.length - 1];  // 最新球號

        if (!data.ballList) {
            this.balls.forEach((ball) => {
                ball.setAction(false);
                cc.Tween.stopAllByTarget(ball.node); // 停止所有動畫
                ball.node.opacity = 255; // 還原透明度
            });
        } else {
            this.balls.forEach((ball, index) => {
                const num = data.ballList[index];
                const node = ball.node;

                if (index < data.ballList.length) {
                    ball.setAction(true);
                    ball.setBallNumber(num);

                    cc.Tween.stopAllByTarget(node);
                    node.opacity = 255;

                    if (num === latestBall) {
                        // 明暗閃爍 5 秒
                        const blink = cc.tween(node)
                            .repeatForever(
                                cc.tween()
                                    .to(0.3, { opacity: 80 })
                                    .to(0.3, { opacity: 255 })
                            )
                            .start();

                        this.scheduleOnce(() => {
                            cc.Tween.stopAllByTarget(node);
                            node.opacity = 255;
                        }, 5);
                    }
                } else {
                    ball.setAction(false);
                    cc.Tween.stopAllByTarget(node);
                    node.opacity = 255;
                }
            });
        }

        CommonTool.setLabel(this.Label_TableID, data.tableId);
    }
}

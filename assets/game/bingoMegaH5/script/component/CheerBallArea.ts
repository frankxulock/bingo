import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/EventManager/EventManager";
import BallCompoent from "./BallCompoent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CheerBallArea extends MegaComponent {
    @property({ type: cc.Label, visible: true })
    private Label_CurrentBalls : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_TotalBalls : cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Node_BallAnimArea : cc.Node = null;
    private Balls : BallCompoent[] = [];
    private userIndex : number = 0;
    private StartPos : cc.Vec2 = new cc.Vec2(-14, 0);
    private isAnim : boolean = false;   // 是否正在播放動畫

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendBall, this.SendBall, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SendBall, this.SendBall, this);
    }

    protected init(): void {
        super.init();
        this.Balls = this.Node_BallAnimArea.getComponentsInChildren(BallCompoent);
        this.node.on('click', this.OpenBallDetailsWindow, this);
    }

    /** 開啟球號資訊詳情頁面 */
    public OpenBallDetailsWindow(){
        console.log("開啟球號資訊詳情頁面");
    }

    /** 快照事件狀態還原 */
    protected onSnapshot(): void {
        
    }

    /** 發球功能 */
    public SendBall() {
        let ballCount = this.data.getBallCount();
        CommonTool.setLabel(this.Label_CurrentBalls, ballCount);
        CommonTool.setLabel(this.Label_TotalBalls, this.data.getTotalBallCount());

        this.SendBallAnim();
        console.log("userIndex " + this.userIndex);
    }

    /** 發球動畫 */
    public SendBallAnim() {
        if(this.isAnim)
            return;
        this.isAnim = true;

        let ballNum = this.data.getCurrentBallNumber();
        this.Balls[this.userIndex].setAction(true);
        this.Balls[this.userIndex].setBallNumber(ballNum);
        this.Balls[this.userIndex].setPosition(this.StartPos);

        this.Balls.forEach((obj, index)=>{
            let curNdoe = obj.node;
            let curPos = obj.getPosition();
            let targetPos = new cc.Vec3(curPos.x + obj.getSize(), curPos.y, 0);   
            let tween = cc.tween(curNdoe).to(1, { position: targetPos }, { easing: 'backOut' });
            cc.Tween.stopAllByTarget(curNdoe);

            // 檢查是否為最後一個物件
            if (index === this.Balls.length - 1) {
                tween.call(() => {
                    this.isAnim = false;
                    // console.log('最後一個球的動畫播放完畢');
                });
            }   
            tween.start();
        })

        this.userIndex++;
        if(this.userIndex >= this.Balls.length)
            this.userIndex = 0;
    }
}

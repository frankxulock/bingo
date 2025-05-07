import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
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
    private animationQueue: number[] = [];
    private isAnimating: boolean = false;

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
        this.Balls.forEach((obj, index)=>{ obj.init(); });
        this.node.on('click', this.OpenBallDetailsWindow, this);
    }

    /** 開啟球號資訊詳情頁面 */
    public OpenBallDetailsWindow(){
        console.log("開啟球號資訊詳情頁面");
    }

    /** 快照事件狀態還原 */
    protected onSnapshot(): void {
        this.UpdateLabel();
        const ballList = this.data.getBallList(); // 假設返回目前已開出球號的 array
        this.userIndex = 0;
    
        // 清空球的狀態
        this.Balls.forEach((obj, index)=>{
            cc.Tween.stopAllByTarget(obj.node);
        })
    
        // 根據目前已開出的球號數據還原球
        for (let i = 0; i < ballList.length && i < this.Balls.length; i++) {
            const ballNum = ballList[i];
            const ballObj = this.Balls[i];

            ballObj.setBallNumber(ballNum);
            ballObj.setAction(true);

            // 計算位置：StartPos + i * ball 寬度
            const offsetX = ballObj.getSize() * (i + 1);
            const newPos = this.StartPos.add(new cc.Vec2(offsetX, 0));
            ballObj.setPosition(newPos);
            this.userIndex++;
        }
    }

    /** 遊戲結束事件狀態還原 */
    protected onGameOver(): void {
        this.UpdateLabel();
        this.ResetAllBalls();
    }

    /** 發球邏輯入口 */
    public SendBall() {
        this.UpdateLabel();
        const ballNum = this.data.getCurrentBallNumber();
        this.animationQueue.push(ballNum);
        this.tryRunAnimation();
    }

    /** 更新球號文字訊息 */
    private UpdateLabel() {
        CommonTool.setLabel(this.Label_CurrentBalls, this.data.getBallCount());
        CommonTool.setLabel(this.Label_TotalBalls, ("/" + this.data.getTotalBallCount()));
    }

    /** 嘗試執行下一筆球動畫 */
    private tryRunAnimation() {
        if (this.isAnimating || this.animationQueue.length === 0) return;

        const nextBall = this.animationQueue.shift();
        this.playBallAnim(nextBall);
    }

    /** 動畫主邏輯 */
    private playBallAnim(ballNum: number) {
        this.isAnimating = true;

        const maxBalls = this.Balls.length;
        const offset = this.Balls[0].getSize();
    
        const currentIndex = this.userIndex % maxBalls;
        const newBall = this.Balls[currentIndex];
        newBall.setBallNumber(ballNum);
        newBall.setAction(true);
        newBall.setPosition(this.StartPos);
    
        // 所有球一起往右平移一格
        const movePromises: Promise<void>[] = [];
        for (let i = 0; i < maxBalls; i++) {
            const ball = this.Balls[i];
            const node = ball.node;
            const curPos = ball.getPosition();
            const newX = curPos.x + offset;

            cc.Tween.stopAllByTarget(node);
            movePromises.push(
                new Promise<void>((resolve) => {
                    cc.tween(node)
                        .to(0.4, { position: new cc.Vec3(newX, curPos.y, 0) }, { easing: 'sineOut' })
                        .call(resolve)
                        .start();
                })
            );
        }
    
        Promise.all(movePromises).then(() => {
            this.userIndex = (this.userIndex + 1) % maxBalls;  // ✅ 循環更新
            this.isAnimating = false;
            this.tryRunAnimation(); // 繼續播放下一球
        });
    }

    /** 重置時取消動畫 */
    public ResetAllBalls() {
        // 停止所有球的動畫
        this.Balls.forEach(ball => cc.Tween.stopAllByTarget(ball.node));
    
        // 清除狀態
        this.userIndex = 0;
        this.isAnimating = false;
        this.animationQueue = [];
    
        // 清除位置
        this.Balls.forEach(ball => {
            ball.setBallNumber(null); // 或 setVisible(false)
            ball.setPosition(this.StartPos);
            ball.setAction(false);
        });
    }
}

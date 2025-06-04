import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import EventManager, { GameStateEvent, GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import BallCompoent from "../../../Common/Base/component/BallCompoent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CheerBallArea extends MegaComponent {
    /** 顯示目前已發送的球數 */
    @property({ type: cc.Label, visible: true })
    private Label_CurrentBalls: cc.Label = null;

    /** 顯示球數總數，例如 " / 75" */
    @property({ type: cc.Label, visible: true })
    private Label_TotalBalls: cc.Label = null;

    /** 球動畫顯示區節點，包含多個 BallCompoent */
    @property({ type: cc.Node, visible: true })
    private Node_BallAnimArea: cc.Node = null;

    /** 所有子球元件的陣列 */
    private Balls: BallCompoent[] = [];

    /** 記錄目前動畫插入位置的索引 */
    private userIndex: number = 0;

    /** 球起始位置，所有球從此點開始動畫 */
    private StartPos: cc.Vec2 = new cc.Vec2(-14, 0);

    /** 動畫佇列，依序播放球號動畫 */
    private animationQueue: number[] = [];

    /** 是否正在播放動畫 */
    private isAnimating: boolean = false;

    /**
     * 監聽遊戲事件
     */
    protected addEventListener(): void {
        super.addEventListener();
        // 抽號碼時開啟球號區
        EventManager.getInstance().on(GameStateEvent.GAME_DRAWTHENUMBERS, this.Open, this);
        // 發球時播放球號動畫
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_SendBall, this.SendBall, this);
        document.addEventListener("visibilitychange", this.onSnapshot.bind(this));
    }

    /**
     * 移除監聽事件，避免重複監聽或內存泄漏
     */
    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateEvent.GAME_DRAWTHENUMBERS, this.Open, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_SendBall, this.SendBall, this);
        document.removeEventListener("visibilitychange", this.onSnapshot.bind(this));
    }

    /**
     * 初始化元件
     */
    protected init(): void {
        super.init();

        // 取得所有子球元件
        this.Balls = this.Node_BallAnimArea.getComponentsInChildren(BallCompoent);

        // 點擊整個區域開啟球號詳情視窗
        this.node.on('click', this.OpenBallDetailsWindow, this);
    }

    /**
     * 開啟所有球號資訊詳細視窗
     */
    public OpenBallDetailsWindow() {
        PopupManager.showPopup(PopupName.AllBallNumbersPage, this.data.getAllBallNumbersPageData());
    }

    /**
     * 快照回復遊戲狀態
     * 用於重播或切換場景時還原球號狀態與位置
     */
    protected onSnapshot(): void {
        this.node.active = !this.data.GameStateBUY();
        this.UpdateLabel();

        const ballList = this.data.getBallList(); // 所有已開球號碼
        const maxBalls = this.Balls.length;
        const totalBalls = ballList.length;

        // 停止所有動畫
        this.Balls.forEach(ball => cc.Tween.stopAllByTarget(ball.node));

        // 從最後往前數）
        for (let i = 0; i < maxBalls; i++) {
            const reverseIndex = totalBalls - 1 - i;
            if (reverseIndex < 0) break;

            const ballNum = ballList[reverseIndex];
            const ball = this.Balls[i];

            ball.setBallNumber(ballNum);
            ball.setAction(true);

            const offsetX = ball.getSize() * (i + 1);
            const newPos = this.StartPos.add(new cc.Vec2(offsetX, 0));
            ball.setPosition(newPos);
        }

        // ✅ 計算 x 最大的球，並將 userIndex 設為下一個
        let maxX = Number.NEGATIVE_INFINITY;
        let nextIndex = 0;
        for (let i = 0; i < maxBalls; i++) {
            const x = this.Balls[i].getPosition().x;
            if (x > maxX) {
                maxX = x;
                nextIndex = (i) % maxBalls;
            }
        }
        this.userIndex = nextIndex;
        this.isAnimating = false;
        // // 🔍 Debug：列印快照結果
        // cc.log(`=== 快照復原 Debug Info ===`);
        // cc.log(`userIndex（下一顆應插入位置）: ${this.userIndex}`);
        // this.Balls.forEach((b, idx) => {
        //     const pos = b.getPosition();
        //     // const num = b.getBallNumber?.(); // 確保你有這方法
        //     cc.log(`Ball[${idx}] -> 編號: ${""}, 位置: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`);
        // });
        // cc.log(`============================`);
    }

    /**
     * 遊戲結束時還原狀態，重置顯示與動畫
     */
    protected onNewGame(): void {
        this.UpdateLabel();
        this.ResetAllBalls();
        this.Close();
    }

    /**
     * 發球時呼叫，加入動畫佇列並嘗試播放
     */
    public SendBall() {
        this.UpdateLabel();

        const ballNum = this.data.getCurrentBallNumber();
        if (ballNum != null) {
            this.animationQueue.push(ballNum);
            this.tryRunAnimation();
        }
    }

    /**
     * 更新顯示的球數字 Label
     */
    private UpdateLabel() {
        CommonTool.setLabel(this.Label_CurrentBalls, this.data.getBallCount());
        CommonTool.setLabel(this.Label_TotalBalls, "/" + this.data.getTotalBallCount());
    }

    /**
     * 嘗試執行下一個動畫，若目前無動畫正在播放且隊列非空
     */
    private tryRunAnimation() {
        if (this.isAnimating || this.animationQueue.length === 0) return;

        const nextBall = this.animationQueue.shift();
        this.playBallAnim(nextBall);
    }

    /**
     * 執行單個球的動畫邏輯
     * @param ballNum 球號
     */
    private playBallAnim(ballNum: number) {
        this.isAnimating = true;

        const maxBalls = this.Balls.length;
        const offset = this.Balls[0].getSize();

        // 取得目前要顯示球的索引（環狀）
        const currentIndex = this.userIndex % maxBalls;
        const newBall = this.Balls[currentIndex];

        // 重設新球狀態與位置
        newBall.setBallNumber(ballNum);
        newBall.setAction(true);
        newBall.setPosition(this.StartPos);

        // 所有球往右移動一格動畫
        for (let i = 0; i < maxBalls; i++) {
            const ball = this.Balls[i];
            const node = ball.node;
            const curPos = ball.getPosition();
            const newX = curPos.x + offset;

            cc.tween(node)
                .to(0.4, { position: new cc.Vec3(newX, curPos.y, 0) })
                .call(() => {
                    // 最後一個球的動畫結束後，更新索引並繼續下一個動畫
                    if (i === maxBalls - 1) {
                        this.userIndex = (this.userIndex - 1) % maxBalls;
                        if(this.userIndex < 0)
                            this.userIndex = maxBalls -1;
                        this.isAnimating = false;
                        this.tryRunAnimation();

                        // // 🔍 Debug：列印所有球資訊
                        // cc.log(`=== 球動畫完成 Debug Info ===`);
                        // cc.log(`userIndex（下一顆插入位置）: ${this.userIndex}`);
                        // this.Balls.forEach((b, idx) => {
                        //     const pos = b.getPosition();
                        //     // const num = b.getBallNumber?.(); // 如果你有這個 getter
                        //     cc.log(`Ball[${idx}] -> 編號: ${""}, 位置: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`);
                        // });
                        // cc.log(`============================`);
                    }
                })
                .start();
        }
    }

    /**
     * 重置所有球狀態與動畫，回到初始位置
     */
    public ResetAllBalls() {
        // 停止所有球的動畫
        this.Balls.forEach(ball => cc.Tween.stopAllByTarget(ball.node));

        // 重置狀態
        this.userIndex = 0;
        this.isAnimating = false;
        this.animationQueue = [];

        // 清除球號顯示與位置
        this.Balls.forEach(ball => {
            ball.setBallNumber(null);  // 清除球號
            ball.setPosition(this.StartPos);
            ball.setAction(false);
        });
    }

    /**
     * 開啟該元件（顯示）
     */
    public Open() {
        this.node.active = true;
    }

    /**
     * 關閉該元件（隱藏）
     */
    public Close() {
        this.node.active = false;
    }
}

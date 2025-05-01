import prizeData from "../../Common/Base/CommonData";
import MegaComponent from "../../Common/Base/gameMega/MegaComponent";

const {ccclass, property} = cc._decorator;

/*** 公用圖片與資訊設定管理處 */
@ccclass
export default class BingoMegaUI extends MegaComponent {

    @property({ type: [cc.SpriteFrame], visible: true })
    private ballBG: cc.SpriteFrame[] = [];
    @property({ type: [prizeData], visible: true })
    protected prizeDataList : prizeData[] = []; // 中獎圖示資料

    protected init(): void {
        super.init();
        let data = {
            ballBG : this.ballBG,
            prizeDataList : this.prizeDataList,
        }
        this.data.setInitData(data);
    }

    // 快照事件（恢復遊戲狀態）
    public State_Snapshot(): void {
        console.log("快照事件（恢復遊戲狀態）");
    }
    
    /** 加載遊戲資源 */
    public State_Loading(): void {
        console.log("加載遊戲資源");
    }

    /** 購卡時間 */
    public State_Buy(): void {
        console.log("購卡時間");
    }

    /** 開球時間 */
    public State_Drawthenumbers(): void {
        console.log("開球時間");
    }

    /** 開獎時間 */
    public State_Reward(): void {
        console.log("開獎時間");
    }
}
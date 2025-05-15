import BingoMegaUI from "../../../bingoMegaH5/script/BingoMegaUI";
import { CommonTool } from "../../../common/Tools/CommonTool";
import AvatarComponent from "./AvatarComponent";
import BallComponent from "./BallCompoent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LeaderboardItem extends cc.Component {

    /** 名次徽章的 Sprite */
    @property({ type: cc.Sprite, visible: true })
    private Sprite_num: cc.Sprite = null;

    /** 名次數字 Label，當名次大於等於4才顯示 */
    @property({ type: cc.Label, visible: true })
    private Label_num: cc.Label = null;

    /** 頭像組件 */
    @property({ type: AvatarComponent, visible: true })
    private Node_Avatar: AvatarComponent = null;

    /** 玩家名稱 Label */
    @property({ type: cc.Label, visible: true })
    private Label_name: cc.Label = null;

    /** 球號組件陣列，最多 3 顆 */
    @property({ type: BallComponent, visible: true })
    private Node_Balls: BallComponent[] = [];

    /** Blackout 顯示的 Label */
    @property({ type: cc.Label, visible: true })
    private Label_blackout: cc.Label = null;

    /** 購買卡片數量 Label */
    @property({ type: cc.Label, visible: true })
    private Label_BuyCardNum: cc.Label = null;

    /**
     * 設定排行榜項目資料與顯示狀態
     * @param data 玩家資料物件，包含 name, image, ball 陣列等
     * @param index 排名索引，從 0 開始
     */
    setData(data: any, index?: number) {
        if (!data) return;

        // 取得 BingoMegaUI 單例，方便存取共用 UI 資源與方法
        const ui = BingoMegaUI.getInstance();

        // 設定排行榜背景圖（依名次不同取得不同背景）
        const bgSprite = ui.getLeaderboardBG(index);
        CommonTool.setSprite(this.node, bgSprite);

        // 設定名次徽章（前三名有專屬圖示）
        const rankIcon = ui.getDengjiIcon(index);
        CommonTool.setSprite(this.Sprite_num, rankIcon);

        // 判斷是否顯示數字名次（第4名起顯示文字名次）
        const isShowTextRank = (index >= 3);
        this.Label_num.node.active = isShowTextRank;
        if (isShowTextRank) {
            CommonTool.setLabel(this.Label_num, (index + 1).toString());
        }

        // 設定頭像：有圖片載入遠端，無則使用預設圖示
        if (!data.image) {
            const defaultUserIcon = ui.getUserIcon(index);
            this.Node_Avatar.setSprite(defaultUserIcon);
        } else {
            this.Node_Avatar.loadRemoteImage(data.image);
        }

        // 設定玩家名稱
        CommonTool.setLabel(this.Label_name, data.name);

        // 設定球號，最多顯示 3 顆球
        if (Array.isArray(data.ball)) {
            this.Node_Balls.forEach((ballNode, i) => {
                const num = data.ball[i];
                if (num != null) {
                    ballNode.setAction(true);   // 顯示並啟用動畫
                    ballNode.setBallNumber(num);
                } else {
                    ballNode.setAction(false);  // 隱藏或停用動畫
                }
            });
        }

        // Blackout 數字顯示規則：當球數 >= 3 時，顯示 "+num"
        const blackoutText = (data.ball.length >= 3) ? ("+" + data.num) : "";
        CommonTool.setLabel(this.Label_blackout, blackoutText);

        // 購買卡數顯示，前面加 "+"
        CommonTool.setLabel(this.Label_BuyCardNum, "+" + data.BuyCard);
    }
}

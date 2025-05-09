import AvatarComponent from "../../../Common/Base/component/AvatarComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import BingoMegaUI from "../BingoMegaUI";
import BallComponent from "./BallCompoent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LeaderboardItem extends cc.Component {

    @property({ type: cc.Sprite, visible: true })
    private Sprite_num: cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    private Label_num: cc.Label = null;
    @property({ type: AvatarComponent, visible: true })
    private Node_Avatar: AvatarComponent = null;
    @property({ type: cc.Label, visible: true })
    private Label_name: cc.Label = null;
    @property({ type: BallComponent, visible: true })
    private Node_Balls: BallComponent[] = [];
    @property({ type: cc.Label, visible: true })
    private Label_blackout: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_BuyCardNum: cc.Label = null;

    private data : any;

    setData(data: any, index?: number) {
        if (!data) return;
    
        this.data = data;
    
        // 👉 取得當前節點在父節點中的索引
        // const index = this.node.getSiblingIndex();
        const ui = BingoMegaUI.getInstance();

        // 🟩 設定背景板圖片
        const bgSprite = ui.getLeaderboardBG(index);
        CommonTool.setSprite(this.node, bgSprite);
    
        // 🔢 設置名次徽章或數字
        const rankIcon = ui.getDengjiIcon(index);
        CommonTool.setSprite(this.Sprite_num, rankIcon);
        const isShowTextRank = (index >= 3);
        this.Label_num.node.active = isShowTextRank;
        if (isShowTextRank) {
            CommonTool.setLabel(this.Label_num, (index + 1).toString());
        }
    
        // 🖼️ 設置頭像圖片
        if (!data.image) {
            const defaultUserIcon = ui.getUserIcon(index);
            this.Node_Avatar.setSprite(defaultUserIcon);
        } else {
            this.Node_Avatar.loadRemoteImage(data.image);
        }
    
        // 👤 設置名稱
        CommonTool.setLabel(this.Label_name, data.name);
    
        // ⚪ 設置球號（最多 3 顆）
        if (Array.isArray(data.ball)) {
            this.Node_Balls.forEach((ballNode, i) => {
                const num = data.ball[i];
                if (num != null) {
                    ballNode.setAction(true);
                    ballNode.setBallNumber(num);
                } else {
                    ballNode.setAction(false);
                }
            });
        }
    
        // 🕹️ 設置 Blackout 數字與購買卡數
        let Label_blackout = (data.ball.length >= 3) ? ("+" + data.num) : "";
        CommonTool.setLabel(this.Label_blackout, Label_blackout);
        CommonTool.setLabel(this.Label_BuyCardNum,  "+" + data.BuyCard);
    }    
}

import AvatarComponent from "../../../Common/Base/component/AvatarComponent";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UserStatsPanel extends MegaComponent {
    @property({ type: cc.Node, visible: true })
    private Node_UserRanking : cc.Node = null;
    @property({ type: cc.Label, visible: true })
    private Label_Online : cc.Label = null;
    private Avatars : AvatarComponent[] = [];

    protected init(): void {
        super.init();
        this.Avatars = this.Node_UserRanking.getComponentsInChildren(AvatarComponent);
        this.node.on('click', this.OpenBingoJackpotWindow, this);
    }

    protected start(): void {
        this.Avatars.forEach((avatar)=>{
            avatar.setSize(24, 1);
        })
    }

    /** 開啟排行榜詳情列表 */
    public OpenBingoJackpotWindow(){
        console.log("開啟排行榜詳情列表");
    }

    /** 快照事件狀態還原 */
    protected onSnapshot(): void {
        CommonTool.setLabel(this.Label_Online, this.data.getOnline());
    }
}

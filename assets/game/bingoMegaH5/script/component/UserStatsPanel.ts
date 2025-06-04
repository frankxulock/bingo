import AvatarComponent from "../../../Common/Base/component/AvatarComponent";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserStatsPanel extends MegaComponent {
    // 用戶排名節點，包含多個 AvatarComponent 子節點
    @property({ type: cc.Node, visible: true })
    private Node_UserRanking: cc.Node = null;

    // 在線人數的顯示標籤
    @property({ type: cc.Label, visible: true })
    private Label_Online: cc.Label = null;

    // 存放所有 AvatarComponent 的陣列
    private Avatars: AvatarComponent[] = [];
    
    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_Online, this.onSnapshot, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_Online, this.onSnapshot, this);
    }

    /**
     * 初始化元件
     * 取得 Node_UserRanking 下的所有 AvatarComponent，並綁定點擊事件
     */
    protected init(): void {
        super.init();
        this.Avatars = this.Node_UserRanking.getComponentsInChildren(AvatarComponent);

        // 綁定點擊事件，開啟排行榜詳情視窗
        this.node.on('click', this.OpenBingoJackpotWindow, this);
    }

    /**
     * 元件啟動時設定 Avatar 尺寸
     */
    protected start(): void {
        this.Avatars.forEach(avatar => {
            avatar.setSize(24, 1);
        });
    }

    /**
     * 點擊事件處理，開啟 Bingo Jackpot 排行榜視窗並傳入資料
     */
    public OpenBingoJackpotWindow(): void {
        const leaderboardData = this.data.getLeaderboardPageData();
        PopupManager.showPopup(PopupName.LeaderboardPage, leaderboardData);
    }

    /**
     * 快照事件回調，更新在線人數顯示
     */
    protected onSnapshot(): void {
        const onlineCount = this.data.getOnline();
        CommonTool.setLabel(this.Label_Online, onlineCount);
    }
}

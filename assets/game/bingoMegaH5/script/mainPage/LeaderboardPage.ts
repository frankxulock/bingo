import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import ScrollLazyLoader from "../component/ScrollLazyLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LeaderboardPage extends cc.Component implements IWindow {

    @property({ type: cc.ToggleContainer, visible: true })
    private Toggle_Leaderboard: cc.ToggleContainer = null;
    @property({ type: cc.ToggleContainer, visible: true })
    private Toggle_PlayState: cc.ToggleContainer = null;
    @property({ type: cc.Node, visible: true })
    private Node_JackpotGroup: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_ExtraGroup: cc.Node = null;
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_Leaderboard: ScrollLazyLoader = null;
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_History: ScrollLazyLoader = null;

    private data : any = null;
    private LeaderboardIndex = 0;
    private PlayStateIndex = 0;

    open(data: any): void {
        if (!data) return;
    
        this.data = data;
        this.setPageState();

        // 綁定 toggle 事件
        this.bindToggleContainer(this.Toggle_Leaderboard, (index: number) => {
            this.LeaderboardIndex = index;
            this.setPageState();
        });

        this.bindToggleContainer(this.Toggle_PlayState, (index: number) => {
            this.PlayStateIndex = index;
            this.setPageState();
        });
    }

    close(): void {
        PopupManager.closePopup(PopupName.LeaderboardPage);
    }

    /** 設置頁面狀態 */
    setPageState() {
        const isJackpot = this.PlayStateIndex === 0;
        const isLeaderboard = this.LeaderboardIndex === 0;

        // 設定排行榜 or 歷史資料來源
        const rankingData = isJackpot ? this.data.JPRanking : this.data.EPRanking;
        const historyData = isJackpot ? this.data.JPHistory : this.data.EPHistory;

        this.Node_JackpotGroup.active = isLeaderboard && isJackpot;
        this.Node_ExtraGroup.active = isLeaderboard && !isJackpot;
        this.ScrollView_Leaderboard.node.active = isLeaderboard;
        this.ScrollView_History.node.active = !isLeaderboard;

        // 更新資料
        if (isLeaderboard) {
            this.ScrollView_Leaderboard.refreshData(rankingData);
        } else {
            this.ScrollView_History.refreshData(historyData);
        }
    }

    private bindToggleContainer(container: cc.ToggleContainer, callback: (index: number) => void): void {
        container.toggleItems.forEach((toggle, index) => {
            toggle.node.off('toggle'); // 移除之前綁定
            toggle.node.on('toggle', () => {
                if (toggle.isChecked) {
                    callback(index);
                }
            }, this);
        });
    }
}

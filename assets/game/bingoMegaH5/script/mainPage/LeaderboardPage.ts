import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import ScrollLazyLoader from "../../../Common/Tools/Scroll/ScrollLazyLoader";
import BingoPrizeList from "../component/BingoPrizeList";

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
    @property({ type: BingoPrizeList, visible: true })
    private BingoPrizeList: BingoPrizeList = null;

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

        const rankingData = isJackpot ? this.data.JPRanking : this.data.EPRanking;
        const historyData = isJackpot ? this.data.JPHistory : this.data.EPHistory;

        // 控制顯示的節點
        this.Node_JackpotGroup.active = isLeaderboard && isJackpot;
        this.Node_ExtraGroup.active = isLeaderboard && !isJackpot;
        this.ScrollView_Leaderboard.node.active = isLeaderboard;
        this.ScrollView_History.node.active = !isLeaderboard;
        this.BingoPrizeList.updatePrizeAmounts();

        // 根據當前頁面顯示對應資料
        const dataToRefresh = isLeaderboard ? rankingData : historyData;
        const scrollView = isLeaderboard ? this.ScrollView_Leaderboard : this.ScrollView_History;

        if (dataToRefresh) {
            scrollView.refreshData(dataToRefresh);
        }
        // 更新標籤
        this.Toggle_Leaderboard.toggleItems.forEach((toggle, index) => {
            // 第一個子節點為選中標記或樣式切換節點
            toggle.node.children[0].active = !toggle.isChecked;
        });
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

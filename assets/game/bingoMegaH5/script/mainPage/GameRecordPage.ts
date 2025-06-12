import DateInstance from "../../../Common/Base/component/DateInstance";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import ScrollLazyLoader from "../../../Common/Tools/Scroll/ScrollLazyLoader";
import matchDetails from "../component/matchDetails";
import { HttpServer } from "../HttpServer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameRecordPage extends cc.Component implements IWindow {

    // 主要模塊
    @property({ type: cc.Node, visible: true })
    private Node_gameHistory : cc.Node = null;
    @property({ type: matchDetails, visible: true })
    private Node_matchDetails : matchDetails = null;
    // gameHistory 細節部分
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_historyRecords : ScrollLazyLoader = null;
    @property({ type: cc.Toggle, visible: true })
    private Toggle_menu : cc.Toggle = null;
    @property({ type: cc.Label, visible: true })
    private Label_type : cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private DateNode : cc.Node = null;
    @property({ type: cc.Label, visible: true })
    private Label_startDate : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_endDate : cc.Label = null;

    // 歷史資料
    private data;
    private selectedStartDate: Date = null;
    private selectedEndDate: Date = null;
    private state: number = 4;  // 要顯示的遊戲類型

    protected onLoad(): void {
        this.ScrollView_historyRecords.node.on("ScrollItemEvent", this.onItemChanged, this);
    }

    protected onDestroy(): void {
        this.ScrollView_historyRecords?.node?.off("ScrollItemEvent", this.onItemChanged, this);
    }

    open(data?: any): void {
        const now = new Date();

        // 今天結束：23:59:59.999
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);
        // 7 天前：00:00:00.000
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        this.Label_startDate.string = CommonTool.formatDateToMMDDYYYY(sevenDaysAgo); // 03/12/2025
        this.Label_endDate.string = CommonTool.formatDateToMMDDYYYY(endOfToday); // 03/12/2025

        this.selectedStartDate = sevenDaysAgo;
        this.selectedEndDate = endOfToday;
        this.setPageState(data);
    }

    close?(): void {
        PopupManager.closePopup(PopupName.GameRecordPage);
    }

    public setPageState(data) {
        if(data?.data?.list) {
            this.data = data.data.list;
            this.Node_gameHistory.active = true;
            this.Node_matchDetails.node.active = false;
            this.ScrollView_historyRecords.node.active = true;
            this.ScrollView_historyRecords.refreshData(data.data.list);
        }else {
            this.ScrollView_historyRecords.node.active = false;
            // if(data?.data?.total != 0)
        }
    }

    /** 返回按鈕 */
    public OnBack() {
        // 已經開啟matchDetails頁面先關閉
        if(this.Node_matchDetails.node.active) {
            this.Node_matchDetails.node.active = false;
        }else {
            this.close();
        }
    }

    /** 開啟選擇日期 */
    public OnStartDate() {
        this.DateNode.getComponent(DateInstance).open(this.selectedStartDate.getTime(), this.selectedEndDate.getTime(), 0);
    }
    public OnEndDate() {
        this.DateNode.getComponent(DateInstance).open(this.selectedStartDate.getTime(), this.selectedEndDate.getTime(), 1);
    }
    /** 設定日期 */
    public setDate(start : Date, end : Date) {
        this.selectedStartDate = start;
        this.selectedEndDate = end;
        
        // 更新界面显示的日期标签
        this.Label_startDate.string = CommonTool.formatDateToMMDDYYYY(start);
        this.Label_endDate.string = CommonTool.formatDateToMMDDYYYY(end);
        
        this.POSTHistory();
    }

    /** 選擇mega資訊 */
    public OnMenu() {
        this.Toggle_menu.isChecked = false;
        // console.warn("選擇mega資訊");
        this.Label_type.string = "MEGA";
        this.state = 4;
        this.POSTHistory();
    }
    /** 選擇gift資訊 */
    public OnGift() {
        this.Toggle_menu.isChecked = false;
        this.Label_type.string = "Gift";
        this.state = 3;
        this.POSTHistory();
    }
    /** 選擇PreBuy資訊 */
    public OnPreBuy() {
        this.Toggle_menu.isChecked = false;
        this.Label_type.string = "Pre-Buy";
        this.state = 1;
        this.POSTHistory();
    }

    /** 開啟歷史詳情 */
    private onItemChanged(index : number) {

        this.Node_matchDetails.setPageState(this.data[index]);
        this.Node_matchDetails.node.active = true;
    }

    /** 重新請求數據 */
    public POSTHistory() {
        HttpServer.InfoHistory(this.selectedStartDate.getTime(), this.selectedEndDate.getTime(), this.state)
        .then(results => {

            this.setPageState(results);
        });
    }
}

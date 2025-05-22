import BallComponent from "../../../Common/Base/component/BallCompoent";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import ScrollLazyLoader from "../../../Common/Tools/Scroll/ScrollLazyLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameRecordPage extends cc.Component implements IWindow {

    // 主要模塊
    @property({ type: cc.Node, visible: true })
    private Node_gameHistory : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_matchDetails : cc.Node = null;
    // gameHistory 細節部分
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_historyRecords : ScrollLazyLoader = null;
    @property({ type: cc.Toggle, visible: true })
    private Toggle_menu : cc.Toggle = null;
    @property({ type: cc.Label, visible: true })
    private Label_type : cc.Label = null;
    
    // 歷史資料
    private data;
    // 是否開啟matchDetails頁面
    private isMatchDetails : boolean = false;

    open(data?: any): void {
        this.data = data;
        // throw new Error("Method not implemented.");
    }
    close?(): void {
        PopupManager.closePopup(PopupName.GameRecordPage);
    }

    /** 返回按鈕 */
    public OnBack() {
        // 已經開啟matchDetails頁面先關閉
        if(this.isMatchDetails) {
            this.isMatchDetails = false;
            this.Node_matchDetails.active = false;
        }else {
            this.close();
        }
    }

    /** 開啟選擇日期 */
    public OnRecordDate() {
        console.warn("開啟選擇日期");
    }

    /** 選擇mega資訊 */
    public OnMenu() {
        this.Toggle_menu.isChecked = false;
        console.warn("選擇mega資訊");
    }
    /** 選擇gift資訊 */
    public OnGift() {
        this.Toggle_menu.isChecked = false;
        console.warn("選擇gift資訊");
    }
    /** 選擇PreBuy資訊 */
    public OnPreBuy() {
        this.Toggle_menu.isChecked = false;
        console.warn("選擇PreBuy資訊");
    }

    /** 開啟歷史詳情 */
    public OpenMatchDetails() {

    }
}

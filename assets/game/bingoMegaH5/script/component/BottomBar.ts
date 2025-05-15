import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BottomBar extends MegaComponent {
    @property({ type: cc.Label, visible: true })
    private Label_Currency: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    private Label_Amount: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    private Label_coin: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    private Label_wallet: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    private Btn_AddGameCoin: cc.Node = null;

    /** 初始化元件（由 MegaComponent 呼叫） */
    protected init(): void {
        super.init();
    }

    /** 開啟添加遊戲金額頁面（待實作） */
    public OpenAddGameCoin(): void {
        console.log("開啟添加遊戲金額頁面");
        // 可在此調用彈窗管理器或跳轉頁面邏輯
    }

    /** 開啟聊天彈窗 */
    public OpenChatPage(): void {
        const chatData = this.data.getChatPage();
        PopupManager.showPopup(PopupName.ChatPage, chatData);
    }

    /** 開啟個人中心彈窗 */
    public OpnePersonalCenterPage(): void {
        const personalData = this.data.getPersonalCenterPage();
        PopupManager.showPopup(PopupName.PersonalCenterPage, personalData);
    }

    /** 快照回調，用於畫面更新時觸發 */
    protected onSnapshot(): void {
        this.updateUserData();
    }

    /** 更新顯示的用戶資料（幣種、金額、代幣、錢包） */
    private updateUserData(): void {
        const userData = this.data.getUserData();

        CommonTool.setLabel(this.Label_Currency, this.data.currency);
        CommonTool.setLabel(this.Label_Amount, userData.amount);
        CommonTool.setLabel(this.Label_coin, userData.coin);
        CommonTool.setLabel(this.Label_wallet, userData.wallet);
    }
}
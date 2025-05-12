import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BottomBar extends MegaComponent {
    @property({ type: cc.Label, visible: true })
    private Label_Currency : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_Amount : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_coin : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_wallet : cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Btn_AddGameCoin : cc.Node = null;

    protected init(): void {
        super.init();
    }

    /** 開啟添加遊戲金額頁面 */
    public OpenAddGameCoin() {
        console.log("開啟添加遊戲金額頁面");
    }

    /** 開啟聊天彈窗 */
    public OpenChatPage() {
        PopupManager.showPopup(PopupName.ChatPage, this.data.getChatPage());
    }

    /** 開啟個人中心 */
    public OpnePersonalCenterPage() {
        PopupManager.showPopup(PopupName.PersonalCenterPage, this.data.getPersonalCenterPage());
    }

    protected onSnapshot(): void {
        this.updateUserData();
    }

    /** 更新用戶資料 */
    private updateUserData() {
        let UserData = this.data.getUserData();
        CommonTool.setLabel(this.Label_Currency, this.data.currency);
        CommonTool.setLabel(this.Label_Amount, UserData.amount);
        CommonTool.setLabel(this.Label_coin, UserData.coin);
        CommonTool.setLabel(this.Label_wallet, UserData.wallet);
    }
}

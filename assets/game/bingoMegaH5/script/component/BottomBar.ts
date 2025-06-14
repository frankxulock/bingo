import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
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
    private Label_card: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    private Label_betCoin: cc.Label = null;

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateUpdate.StaticUpdate_Coin, this.updateUserData, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateUpdate.StaticUpdate_Coin, this.updateUserData, this);
    }

    /** 初始化元件（由 MegaComponent 呼叫） */
    protected init(): void {
        super.init();
    }

    /** 開啟充值頁面 */
    public OpenAddGameCoin(): void {

    }

    /** 開啟聊天彈窗 */
    public OpenChatPage(): void {
        CommonTool.executeWithLock(this, () => {  
            const chatData = this.data.getChatPageData();
            PopupManager.showPopup(PopupName.ChatPage, chatData);
        }, 0.5, "OpenChatPage");
    }

    /** 開啟個人中心彈窗 */
    public OpnePersonalCenterPage(): void {
        CommonTool.executeWithLock(this, () => {  
            PopupManager.showPopup(PopupName.PersonalCenterPage);
        }, 0.5, "OpnePersonalCenterPage");
    }

    /** 快照回調，用於畫面更新時觸發 */
    protected onSnapshot(): void {
        this.updateUserData();
    }

    /** 更新顯示的用戶資料（幣種、金額、卡片數、下注金額） */
    private updateUserData(): void {
        const userData = this.data.getUserPageData();

        CommonTool.setLabel(this.Label_Currency, userData.currency);
        CommonTool.setLabel(this.Label_Amount, userData.amount);
        CommonTool.setLabel(this.Label_card, userData.cardCount);
        CommonTool.setLabel(this.Label_betCoin, userData.betCoin);
    }
}
import MegaManager from "../../../Common/Base/gameMega/MegaManager";
import { audioManager } from "../../../Common/Tools/AudioMgr";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import { HttpServer } from "../HttpServer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PersonalCenterPage extends cc.Component implements IWindow {

    @property({ type: cc.Sprite, visible: true })
    private Sprite_user : cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    private Label_nickName : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_id : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_coin : cc.Label = null;
    @property({ type: cc.ToggleContainer, visible: true })
    private ToggleContainer_Language : cc.ToggleContainer = null;

    private data : any = null;
    private dataManager : MegaManager = null;
    
    open(): void {
        EventManager.getInstance().on(GameStateUpdate.StaticUpdate_Coin, this.setPageState, this);
        this.dataManager = MegaManager.getInstance();
        this.setPageState();

        this.ToggleContainer_Language.toggleItems.forEach((item, index) => {
            item.node.off("toggle", this.OnChangeLanguage, this);
            item.node.on("toggle", this.OnChangeLanguage, this);
        })
    }
    
    close(): void {
        CommonTool.executeWithLock(this, () => {
            EventManager.getInstance().off(GameStateUpdate.StaticUpdate_Coin, this.setPageState, this);
            PopupManager.closePopup(PopupName.PersonalCenterPage);
        }, 0.5, "close");
    }

    public setPageState(){
        this.data = this.dataManager.getPersonalCenterPageData();
        CommonTool.setLabel(this.Label_nickName, this.data.nickName);
        CommonTool.setLabel(this.Label_id, this.data.id);
        CommonTool.setLabel(this.Label_coin, this.data.coin);
    }

    /** 玩家充值 */
    OnAdd() {

    }

    /** 開啟DIY選擇頁面 */
    OnDIY() {
        CommonTool.executeWithLock(this, () => {
            this.dataManager.SendDIYCardSelectionPage(true, true);
        }, 0.5, "OnDIY");
    }

    /** 開啟歷史紀錄 */
    OnGameRecird() {
        CommonTool.executeWithLock(this, () => {
            this.dataManager.OpenGameRecord();
        }, 0.5, "OnGameRecird");
    }

    /** 開啟遊戲規則 */
    OnHelpCenter() {
        CommonTool.executeWithLock(this, () => {
            PopupManager.showPopup(PopupName.HelpCenterPage);
        }, 0.5, "OnHelpCenter");
    }

    /** 開啟遊戲音效 */
    OnGameSound() {
        CommonTool.executeWithLock(this, () => {
            audioManager.setHtmlFocus(true);
        }, 0.3, "OnGameSound");
    }

    /** 變更語言 */
    OnChangeLanguage(toggle: cc.Toggle) {
        CommonTool.executeWithLock(this, () => {
            // 語言變更邏輯...
        }, 0.3, "OnChangeLanguage");
    }
}

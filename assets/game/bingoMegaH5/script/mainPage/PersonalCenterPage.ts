import MegaDataManager from "../../../common/Base/gameMega/MegaDataManager";
import { audioManager } from "../../../common/Tools/AudioMgr";
import { CommonTool } from "../../../common/Tools/CommonTool";
import { IWindow } from "../../../common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../common/Tools/PopupSystem/PopupManager";

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
    private dataManager : any = null;

    open(data: any): void {
        if(data == null)
            return;
        this.data = data;
        this.dataManager = MegaDataManager.getInstance();
        CommonTool.setLabel(this.Label_nickName, data.nickName);
        CommonTool.setLabel(this.Label_id, data.id);
        CommonTool.setLabel(this.Label_coin, data.coin);

        this.ToggleContainer_Language.toggleItems.forEach((item, index) => {
            item.node.off("toggle", this.OnChangeLanguage, this);
            item.node.on("toggle", this.OnChangeLanguage, this);
        })
    }
    close(): void {
        PopupManager.closePopup(PopupName.PersonalCenterPage);
    }

    /** 玩家充值 */
    OnAdd() {
        console.log("玩家充值");
    }

    /** 開啟DIY選擇頁面 */
    OnDIY() {
        PopupManager.showPopup(PopupName.DIYCardSelectionPage, this.dataManager.getDIYCardSelectionData());
    }

    /** 開啟歷史紀錄 */
    OnGameRecird() {
        console.log("開啟歷史紀錄");
        // PopupManager.showPopup(PopupName.DIYCardSelectionPage, this.dataManager.getDIYCardSelectionData());
    }

    /** 開啟遊戲規則 */
    OnHelpCenter() {
        console.log("開啟遊戲規則");
    }

    /** 開啟遊戲音效 */
    OnGameSound() {
        // this.toggle_Audio.isChecked = true;
        audioManager.setHtmlFocus(true);
    }

    /** 變更語言 */
    OnChangeLanguage(toggle: cc.Toggle) {
        console.log("變更語言");
    }
}

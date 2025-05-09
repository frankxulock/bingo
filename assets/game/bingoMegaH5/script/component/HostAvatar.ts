import AvatarComponent from "../../../Common/Base/component/AvatarComponent";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HostAvatar extends MegaComponent {

    private Avatars : AvatarComponent[] = [];
    private avatarsSize = 32;

    protected init(): void {
        super.init();
        this.Avatars = this.node.getComponentsInChildren(AvatarComponent);
    }

    protected start(): void {
        this.Avatars.forEach((avatar)=>{
            avatar.setSize(this.avatarsSize);
        })
    }
    
    /** 開啟主播資訊頁面 */
    public OpenHostAvatarWindow(){
        PopupManager.showPopup(PopupName.StreamerInfoPage, this.data.getAvatarData());
    }

    // 未來新增監聽更新主播資訊功能設定頭像
    protected onSnapshot(): void {
        console.log("未來新增監聽更新主播資訊功能設定頭像");
    }
}

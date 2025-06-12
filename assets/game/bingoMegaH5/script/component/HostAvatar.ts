import AvatarComponent from "../../../Common/Base/component/AvatarComponent";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HostAvatar extends MegaComponent {

    /** 主播頭像組件陣列 */
    private avatars: AvatarComponent[] = [];

    /** 頭像尺寸設定，預設為 32 */
    private avatarsSize: number = 32;

    /**
     * 初始化，取得所有子節點中的 AvatarComponent 組件
     */
    protected init(): void {
        super.init();
        this.avatars = this.node.getComponentsInChildren(AvatarComponent);
    }

    /**
     * 當節點啟動後，設定所有頭像的尺寸
     */
    protected start(): void {
        this.avatars.forEach(avatar => {
            avatar.setSize(this.avatarsSize);
        });
    }

    /**
     * 開啟主播資訊頁面，並傳遞目前頭像相關的資料
     */
    public openHostAvatarWindow(): void {
        CommonTool.executeWithLock(this, () => {  
            const avatarData = this.data.getAvatarPageData();
            PopupManager.showPopup(PopupName.StreamerInfoPage, avatarData);
        }, 0.5, "openHostAvatarWindow");
    }

    /**
     * 未來用於監聽並更新主播資訊的快照事件
     * 現階段為示意用，尚未實作
     */
    protected onSnapshot(): void {

    }
}

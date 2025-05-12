import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import ToastManager from "../../../Common/Tools/Toast/ToastManager";
import ScrollLazyLoader from "../component/ScrollLazyLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StreamerInfoPage extends cc.Component implements IWindow {
    @property({ type: ScrollLazyLoader }) private ScrollView_AvatarList: ScrollLazyLoader = null;
    @property({ type: cc.Sprite }) private Sprite_hostImage: cc.Sprite = null;

    @property({ type: cc.Label }) private Label_hostName: cc.Label = null;
    @property({ type: cc.Label }) private Label_from: cc.Label = null;
    @property({ type: cc.Label }) private Label_birthday: cc.Label = null;
    @property({ type: cc.Label }) private Label_favorote: cc.Label = null;
    @property({ type: cc.Label }) private Label_fbName: cc.Label = null;

    private AvatarIndex: number = 0;
    private AvatarData: any[] = [];

    protected onLoad(): void {
        this.ScrollView_AvatarList.node.on("ScrollItemEvent", this.onItemChanged, this);
    }

    protected onDestroy(): void {
        this.ScrollView_AvatarList?.node?.off("ScrollItemEvent", this.onItemChanged, this);
    }

    open(data: any): void {
        if (!Array.isArray(data) || data.length === 0) return;

        this.AvatarData = data;
        this.AvatarIndex = 0;
        this.setPageState();
        this.ScrollView_AvatarList.refreshData(data);
    }

    close(): void {
        PopupManager.closePopup(PopupName.StreamerInfoPage);
    }

    /** 玩家點擊主播頭像 */
    private onItemChanged(data: any): void {
        const index = this.AvatarData.findIndex(host => host.hostName === data.hostName);
        if (index !== -1) {
            this.AvatarIndex = index;
            this.setPageState();
        }
    }

    /** 切換至左邊主播 */
    public OnLeft(): void {
        if (!this.AvatarData.length) return;
        this.AvatarIndex = (this.AvatarIndex - 1 + this.AvatarData.length) % this.AvatarData.length;
        this.setPageState();
    }

    /** 切換至右邊主播 */
    public OnRight(): void {
        if (!this.AvatarData.length) return;
        this.AvatarIndex = (this.AvatarIndex + 1) % this.AvatarData.length;
        this.setPageState();
    }

    /** 拷貝主播FB ID */
    public OnCopyFB_ID(): void {
        const host = this.AvatarData[this.AvatarIndex];
        const fbID = host?.fbID;
        if (!fbID) return;

        this.copyTextToClipboard(fbID);
    }

    /** 設置頁面狀態 */
    private setPageState(): void {
        const host = this.AvatarData[this.AvatarIndex];
        if (!host) return;

        CommonTool.loadRemoteImageToSprite(this.Sprite_hostImage, host.hostImage);
        CommonTool.setLabel(this.Label_hostName, host.hostName);
        CommonTool.setLabel(this.Label_from, host.from);
        CommonTool.setLabel(this.Label_birthday, host.birthday);
        CommonTool.setLabel(this.Label_favorote, host.favorote);
        CommonTool.setLabel(this.Label_fbName, host.fbName);
    }

    /** 通用的拷貝處理方法 */
    private copyTextToClipboard(text: string): void {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                cc.log("✅ 拷貝成功:", text);
                ToastManager.showToast("拷貝主播ID 成功");
            }).catch(err => {
                cc.error("❌ 拷貝失敗:", err);
                ToastManager.showToast("拷貝主播ID 失敗");
            });
        } else {
            // 備援方式
            const input = document.createElement("input");
            input.value = text;
            document.body.appendChild(input);
            input.select();
            try {
                document.execCommand("copy");
                cc.log("✅ 備援拷貝成功:", text);
                ToastManager.showToast("拷貝主播ID 成功");
            } catch (err) {
                cc.error("❌ 備援拷貝失敗:", err);
                ToastManager.showToast("拷貝主播ID 失敗");
            }
            document.body.removeChild(input);
        }
    }
}

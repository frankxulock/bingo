import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import ToastManager from "../../../Common/Tools/Toast/ToastManager";
import ScrollLazyLoader from "../component/ScrollLazyLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StreamerInfoPage extends cc.Component implements IWindow  {
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_AvatarList: ScrollLazyLoader = null;
    @property({ type: cc.Sprite, visible: true })
    private Sprite_hostImage: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    private Label_hostName: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_from: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_birthday: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_favorote: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_fbName: cc.Label = null;

    private AvatarIndex = 0;
    private AvatarData = null;

    protected onLoad(): void {
        this.ScrollView_AvatarList.node.on("ScrollItemEvent", this.onItemChanged, this);
    }

    protected onDestroy(): void {
        this.ScrollView_AvatarList?.node?.off("ScrollItemEvent", this.onItemChanged, this);
    }

    open(data: any): void {
        if(data == null)
            return;
        // 暫存主播資訊
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
        this.AvatarData.forEach((host, index)=>{
            if(host.hostName === data.hostName) {
                this.AvatarIndex = index;
                return;
            }
        });
        this.setPageState();
    }

    /** 切換至左邊主播 */
    public OnLeft() {
        this.AvatarIndex--;
        if(this.AvatarIndex < 0){
            this.AvatarIndex = this.AvatarData.length - 1;
        }
        this.setPageState();
    }

    /** 切換至右邊主播 */
    public OnRight() {
        this.AvatarIndex++;
        if(this.AvatarIndex >= this.AvatarData.length){
            this.AvatarIndex = 0;
        }
        this.setPageState();
    }

    /** 拷貝主播FB ID */
    public OnCopyFB_ID() {
        let showHost = this.AvatarData[this.AvatarIndex];
        let fbID = showHost.fbID;

        // 使用 clipboard API 拷貝
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fbID).then(() => {
                cc.log("✅ 已拷貝 FB ID:", fbID);
                ToastManager.showToast("拷貝主播ID 成功")
            }).catch((err) => {
                cc.error("❌ 拷貝 FB ID 失敗:", err);
                ToastManager.showToast("拷貝主播ID 失敗")
            });
        } else {
            // 備援方法：建立一個 input 元素
            const input = document.createElement('input');
            input.value = fbID;
            document.body.appendChild(input);
            input.select();
            try {
                document.execCommand('copy');
                cc.log("✅ 已拷貝 FB ID (備援方法):", fbID);
                ToastManager.showToast("拷貝主播ID 成功");
            } catch (err) {
                cc.error("❌ 備援方法拷貝失敗:", err);
                ToastManager.showToast("拷貝主播ID 失敗");
            }
            document.body.removeChild(input);
        }
    }

    /** 設置頁面狀態 */
    setPageState() {
        if(this.AvatarData == null)
            return;
        let showHost = this.AvatarData[this.AvatarIndex];
        CommonTool.loadRemoteImageToSprite(this.Sprite_hostImage, showHost.hostImage);
        CommonTool.setLabel(this.Label_hostName, showHost.hostName);
        CommonTool.setLabel(this.Label_from, showHost.from);
        CommonTool.setLabel(this.Label_birthday, showHost.birthday);
        CommonTool.setLabel(this.Label_favorote, showHost.favorote);
        CommonTool.setLabel(this.Label_fbName, showHost.fbName);
    }
}

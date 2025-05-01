import AvatarComponent from "../../../Common/Base/component/AvatarComponent";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HostAvatar extends MegaComponent {

    private Avatars : AvatarComponent[] = [];

    protected init(): void {
        super.init();
        this.node.on('click', this.OpenHostAvatarWindow, this);
        this.Avatars = this.node.getComponentsInChildren(AvatarComponent);
    }

    protected start(): void {
        this.Avatars.forEach((avatar)=>{
            avatar.setSize(32);
        })
    }
    
    /** 開啟主播資訊頁面 */
    public OpenHostAvatarWindow(){
        console.log("開啟主播資訊頁面");
    }

    // 未來新增監聽更新主播資訊功能設定頭像
    protected onSnapshot(): void {
        
    }
}

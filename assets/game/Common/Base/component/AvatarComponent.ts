import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AvatarComponent extends cc.Component {
    @property({ type: cc.Node, visible: true })
    private mask : cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private avatar : cc.Node = null;
    private data : any = null;

    protected onLoad(): void {
        this.mask = this.node.children[0];
        this.avatar = this.mask.children[0];
    }

    /** 設定總大小 size : 尺寸   offer 偏移量*/
    setSize(size : number, offer : number = 2) {
        let nodeSize = new cc.Size(size, size);
        let maskSize = new cc.Size(size - offer, size - offer);
        this.node.setContentSize(nodeSize);
        this.mask.setContentSize(maskSize);
        this.avatar.setContentSize(maskSize);
    }

    /** 設定頭像大小 */
    setAvatarSize(size : number) {
        this.avatar.setContentSize(size);
    }

    public setSprite(sp : cc.SpriteFrame) {
        CommonTool.setSprite(this.avatar, sp);
    }

    public loadRemoteImage(url : string) {
        let avatar = this.avatar.getComponent(cc.Sprite);
        CommonTool.loadRemoteImageToSprite(avatar, url);
    }

    public setData(data : any, index?: number) {
        this.data = data;
        let avatar = this.avatar.getComponent(cc.Sprite);
        CommonTool.loadRemoteImageToSprite(avatar, data.hostIcon);
        this.setSize(45);

        this.node.off("click", this.OnClick, this); // 防止重複綁定
        this.node.on("click", this.OnClick, this);
    }

    OnClick() {
        this.node.emit("ItemEvent", this.data);
    }
}

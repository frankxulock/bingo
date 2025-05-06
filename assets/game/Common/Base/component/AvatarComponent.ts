import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AvatarComponent extends cc.Component {
    private mask : cc.Node = null;
    private avatar : cc.Node = null;

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
    }

    /** 設定頭像大小 */
    setAvatarSize(size : number) {
        this.avatar.setContentSize(size);
    }

    setUrl(sp : cc.SpriteFrame) {
        CommonTool.setSprite(this.avatar, sp);
    }
}

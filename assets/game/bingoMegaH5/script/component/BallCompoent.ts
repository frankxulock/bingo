import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import MegaDataManager from "../../../Common/Base/gameMega/MegaDataManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BallCompoent extends MegaComponent {
    @property({ type: cc.Sprite, visible: true })
    private spriteBG : cc.Sprite = null;
    @property({ type: cc.Label, visible: true })
    private ballNum : cc.Label = null;

    // public init() {
    //     super.init();
    //     this.spriteBG = this.getComponent(cc.Sprite);
    //     this.ballNum = this.node.children[0].getComponent(cc.Label);
    // }

    /** 設定是否可見 */
    setAction(action : boolean) {
        this.node.active = action;
    }

    /** 球的大小 */
    getSize(){
        return this.node.getContentSize().width;
    }

    /** 取得位置 */
    getPosition() {
        return this.node.getPosition();
    }

    /** 設定位置 */
    setPosition(pos : cc.Vec2) {
        this.node.setPosition(pos);
    }
    
    /** 設定球號 */
    setBallNumber(ballNum : number) {  
        if(this.data == null){
            this.init();
        }
        CommonTool.setSprite(this.spriteBG, this.data.getBallBG(ballNum));
        CommonTool.setLabel(this.ballNum, ballNum);
    }
}

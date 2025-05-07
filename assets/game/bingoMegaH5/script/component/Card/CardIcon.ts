const {ccclass, property} = cc._decorator;

@ccclass
export default class CardIcon extends cc.Component {
    @property({ type: cc.Sprite, visible: true })
    private Sprite_CardIcon: cc.Sprite = null;
    @property({ type: cc.Node, visible: true })
    private Label_Number: cc.Node = null;
}

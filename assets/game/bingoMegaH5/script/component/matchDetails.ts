import BallComponent from "../../../Common/Base/component/BallCompoent";
import ScrollLazyLoader from "../../../Common/Tools/Scroll/ScrollLazyLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class matchDetails extends cc.Component {
    @property({ type: cc.Sprite, visible: true })
    private Sprite_icon : cc.Sprite = null; 
    @property({ type: cc.Label, visible: true })
    private Label_deltaIcon : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_currencyIcon : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_winLossAmount : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_totalCards : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_tableID : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_time : cc.Label = null; 
    @property({ type: cc.Node, visible: true })
    private Node_extraBalls : cc.Node = null; 
    @property({ type: cc.Node, visible: true })
    private Node_bingoBalls : cc.Node = null; 
    @property({ type: cc.Node, visible: true })
    private Group_Balls : cc.Node = null; 
    @property({ type: cc.Node, visible: true })
    private Group_Balls2 : cc.Node = null; 
    private balls : BallComponent[] = [];
    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_card : ScrollLazyLoader = null; 

    private data;

    /** 設置詳情頁面 */
    public setPageState(data) {
        if(data)
            return;
        
    }
}

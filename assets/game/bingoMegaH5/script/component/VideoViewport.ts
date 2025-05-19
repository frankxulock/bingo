import FlvPlayer from "../../../Common/Base/component/FlvPlayer";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { audioManager } from "../../../Common/Tools/AudioMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VideoViewport extends MegaComponent {
    @property({ type: cc.Toggle, visible: true })
    private toggle_Audio : cc.Toggle = null;
    @property({ type: cc.Toggle, visible: true })
    private toggle_Video : cc.Toggle = null;
    @property({ type: cc.Toggle, visible: true })
    private toggle_Switch : cc.Toggle = null;
    @property({ type: cc.Node, visible: true })
    private Node_Video_hint : cc.Node = null;
    @property({ type: FlvPlayer, visible: true })
    private flvPlayer :FlvPlayer = null;
    @property({type : cc.Node, visible: true})
    private Node_hint : cc.Node = null;

    protected init(): void {
        super.init();
        this.toggle_Audio.node.on('toggle', this.setAudio, this);
        this.toggle_Video.node.on('toggle', this.setVideo, this);
        this.toggle_Switch.node.on('toggle', this.setSwitch, this);
        this.Node_Video_hint.active = false;
    }

    /** 設定音效事件 */
    private setAudio(toggle: cc.Toggle) {
        const isChecked = toggle.isChecked;
        const bgNode = toggle.node.children[0];
        if(bgNode) bgNode.active = !isChecked;
        console.log("設定音效事件  狀態 ", isChecked);
        audioManager.setHtmlFocus(isChecked);
        this.Node_hint.active = false;
    }

    /** 設定視頻視角事件 */
    private setVideo(toggle: cc.Toggle) {
        this.Node_Video_hint.active = toggle.isChecked;
    }

    /** 設定視頻事件 */
    private setSwitch(toggle: cc.Toggle) {
        const isChecked = toggle.isChecked;
        const bgNode = toggle.node.children[0];
        if(bgNode) bgNode.active = !isChecked;
        console.log("設定視頻事件  狀態 ", isChecked);
        if(isChecked){
            this.flvPlayer.startPlay();
        }else {
            this.flvPlayer.cancelPlay();
        }
    }

    public OnHostView() {
        console.log("設定視頻事件 ");
        this.toggle_Video.isChecked = false;
        this.Node_Video_hint.active = false;
        this.UpdateSwitch(true);
        this.flvPlayer.startPlay();
    }

    public OnBallView() {
        console.log("設定視頻事件 ");
        this.toggle_Video.isChecked = false;
        this.Node_Video_hint.active = false;
        this.UpdateSwitch(true);
        this.flvPlayer.startPlay();
    }

    public OnCloseView() {
        this.toggle_Video.isChecked = false;
        this.Node_Video_hint.active = false;
        this.UpdateSwitch(false);
        this.flvPlayer.cancelPlay();
    }

    protected onSnapshot(): void {
        this.playVideo();
    }

    public playVideo() {
        audioManager.setHtmlFocus(true);
        this.toggle_Video.isChecked = true;
        this.UpdateSwitch(true);
        this.flvPlayer.startPlay();
    }

    private UpdateSwitch(action) {
        this.toggle_Switch.node.children[0].active = !action;
        this.toggle_Switch.isChecked = action;
    }
}

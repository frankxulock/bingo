import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { audioManager } from "../../../Common/Tools/AudioMgr";
import FlvPlayer from "./FlvPlayer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class VideoViewport extends MegaComponent {
    @property({ type: cc.Toggle, visible: true })
    private toggle_Audio : cc.Toggle = null;
    @property({ type: cc.Toggle, visible: true })
    private toggle_Video : cc.Toggle = null;
    @property({ type: FlvPlayer, visible: true })
    private flvPlayer :FlvPlayer = null;

    protected init(): void {
        super.init();
        this.toggle_Audio.node.on('toggle', this.setAudio, this);
        this.toggle_Video.node.on('toggle', this.setVideo, this);
    }

    /** 設定音效事件 */
    private setAudio(toggle: cc.Toggle) {
        const isChecked = toggle.isChecked;
        const bgNode = toggle.node.children[0];
        if(bgNode) bgNode.active = !isChecked;
        console.log("設定音效事件  狀態 ", isChecked);
        audioManager.setHtmlFocus(isChecked);
    }

    /** 設定視頻事件 */
    private setVideo(toggle: cc.Toggle) {
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

    protected onSnapshot(): void {
        this.playVideo();
    }

    public playVideo() {
        this.toggle_Audio.isChecked = true;
        audioManager.setHtmlFocus(true);
        this.toggle_Video.isChecked = true;
        this.flvPlayer.startPlay();
    }
}

import CustomToggle from "../../../Common/Base/component/CustomToggle";
import FlvPlayer from "../../../Common/Base/component/FlvPlayer";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { audioManager } from "../../../Common/Tools/AudioMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VideoViewport extends MegaComponent {
    @property({ type: CustomToggle, visible: true })
    private toggle_Audio: CustomToggle = null;

    @property({ type: CustomToggle, visible: true })
    private toggle_Video: CustomToggle = null;

    @property({ type: CustomToggle, visible: true })
    private toggle_Switch: CustomToggle = null;

    @property({ type: cc.Node, visible: true })
    private Node_Audio_hint: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    private Node_Video_hint: cc.Node = null;

    @property({ type: FlvPlayer, visible: true })
    private flvPlayer: FlvPlayer = null;

    private index : number = -1;

    /** 初始化 */
    protected init(): void {
        super.init();

        // 綁定 UI 事件
        this.toggle_Audio.node.on("toggle", () => this.onToggleAudio(this.toggle_Audio), this);
        this.toggle_Video.node.on("toggle", () => this.onToggleVideoHint(this.toggle_Video), this);
        this.toggle_Switch.node.on("toggle", () => this.onToggleVideoSwitch(this.toggle_Switch), this);


        // 初始化 UI 狀態
        this.Node_Video_hint.active = false;
        
        // 初始化播放器
        this.setupPlayer();

        this.onSnapshot();
    }

    /** 設置播放器 */
    private setupPlayer(): void {
        if (!this.flvPlayer) {
            return;
        }
        // 初始化播放器
        this.flvPlayer.init();
    }

    /** 音效開關事件 */
    private onToggleAudio(toggle: CustomToggle): void {
        this.Node_Audio_hint.active = false;
        const isChecked = toggle.isChecked;
        audioManager.setHtmlFocus(isChecked);
        this.resetVideoView();
    }

    /** 顯示/隱藏視角提示 */
    private onToggleVideoHint(toggle: CustomToggle): void {
        this.Node_Video_hint.active = toggle.isChecked;
        let toggleCaontainer = this.Node_Video_hint.children[0].getComponent(cc.ToggleContainer);
        // 先將所有 Toggle 設為 false
        toggleCaontainer.toggleItems.forEach((toggle, i) => {
            toggle.isChecked = false;
        });
        if(this.Node_Video_hint.isValid){
            switch(this.index) {
                case 0:     // 第0個
                    toggleCaontainer.toggleItems[0].isChecked = true;
                    break;
                case 1:     // 第1個
                    toggleCaontainer.toggleItems[1].isChecked = true;
                    break;
                case -1:    // 第2個
                    toggleCaontainer.toggleItems[2].isChecked = true;
                    break;
            }
        }
    }

    /** 播放/關閉影片事件 */
    private onToggleVideoSwitch(toggle: CustomToggle): void {
        const isChecked = toggle.isChecked;
        this.resetVideoView();
        if (isChecked) {
            this.flvPlayer.playCurrentVideo();
            this.index = this.flvPlayer.getCurrentVideoInfo().index;
        } else {
            this.flvPlayer.stop();
            this.index = -1;
        }
    }



    /** 切換至主播視角 */
    public OnHostView(): void {
        this.switchToVideoIndex(0);
    }

    /** 切換至球視角 */
    public OnBallView(): void {
        this.switchToVideoIndex(1);
    }

    /** 切換到指定視頻索引 */
    private switchToVideoIndex(index: number): void {
        this.resetVideoView();
        this.updateVideoSwitch(true);
        this.flvPlayer.playVideoByIndex(index);
        this.index = index;
    }

    /** 關閉所有視角與影片 */
    public OnCloseView(): void {
        this.resetVideoView();
        this.updateVideoSwitch(false);
        this.flvPlayer.stop();
        this.index = -1;
    }

    /** 當快照資料載入完成時觸發 */
    protected onSnapshot(): void {
        let videoUrls = this.data.getVideoUrls();
        
        // 使用有效的測試視頻URL
        videoUrls[0] = "https://mister-ben.github.io/videojs-flvjs/bbb.flv";
        videoUrls[1] = "https://mister-ben.github.io/videojs-flvjs/bbb.flv";

        // 設置視頻源到播放器
        this.flvPlayer.setVideoSources(videoUrls, ['主播視角', '球視角']);

        // 設置初始狀態
        audioManager.setHtmlFocus(true);
        this.resetVideoView();
        this.updateVideoSwitch(true);
        
        // 播放第一個視頻
        if (videoUrls.length > 0) {
            this.switchToVideoIndex(0);
        }
    }

    // ========== UI 輔助方法 ==========

    /** 更新影片開關狀態與 UI */
    private updateVideoSwitch(isOn: boolean): void {
        this.toggle_Switch.isChecked = isOn;
    }

    /** 重置視角提示與按鈕狀態 */
    private resetVideoView(): void {
        this.toggle_Video.isChecked = false;
        this.toggle_Video.node.children[0].active = true;
        this.Node_Video_hint.active = false;
    }
}

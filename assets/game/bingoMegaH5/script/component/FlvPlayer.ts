const { ccclass, property } = cc._decorator;

enum VideoState {
    Init,
    Load,
    Play,
    Cancel,
}

@ccclass
export default class FlvPlayer extends cc.Component {
    @property({ tooltip: 'FLV 视频 URL，例如：https://example.com/video.flv' })
    videoUrl: string = 'https://mister-ben.github.io/videojs-flvjs/bbb.flv';

    @property({ type: cc.Node, tooltip: '跟随的目标节点' })
    targetNode: cc.Node = null;

    @property({ type: Boolean, tooltip: '控制视频是否可以交互' })
    isInteractive: boolean = false; // 设置该值为 true 以启用视频交互

    @property({ type: cc.Node, tooltip: '等待視頻播放' })
	protected flvPlayerLoadingNode: cc.Node = null;
	@property({ type: cc.Node, tooltip: '視頻遮罩' })
	protected noVideoSprite: cc.Node = null;

    private flvPlayer: any = null;
    private videoElement: HTMLVideoElement | null = null;

    onLoad() {
        if (!cc.sys.isBrowser || !this.targetNode) {
            cc.warn('FlvPlayer 仅支持 Web，且 targetNode 必须设置。');
            return;
        }

        this.loadFlvJs(() => {
            this.createVideoElement();
            // 为整个页面添加事件监听器
            // this.addUserInteractionListener();
        });
    }

    private loadFlvJs(callback: () => void): void {
        if ((window as any).flvjs) {
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js';
        script.onload = callback;
        document.body.appendChild(script);
    }

    private createVideoElement(): void {
        this.setStateVideoImg(VideoState.Init);
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('playsinline', ''); // iOS 需要
        this.videoElement.setAttribute('muted', ''); // 自动播放兼容性
        this.videoElement.setAttribute('preload', 'auto');
        this.videoElement.controls = this.isInteractive; // 通过 isInteractive 控制是否显示控制条
        this.videoElement.style.pointerEvents = this.isInteractive ? 'auto' : 'none'; // 通过 isInteractive 控制交互性
        this.videoElement.style.zIndex = '-1'; // 设置比 Cocos Canvas 更低
        this.videoElement.style.position = 'absolute';
        this.videoElement.style.objectFit = 'fill';  // 使视频填充容器，拉伸

        document.body.appendChild(this.videoElement);

        const flvjs = (window as any).flvjs;
        if (flvjs && flvjs.isSupported()) {
            this.flvPlayer = flvjs.createPlayer({
                type: 'flv',
                url: this.videoUrl
            });
            this.flvPlayer.attachMediaElement(this.videoElement);
            this.flvPlayer.load();
            // 不在此时自动播放，而是等待用户交互触发播放
        } else {
            cc.error('flv.js 不支持当前浏览器');
        }
    }

    private addUserInteractionListener(): void {
        // 播放视频的事件
        const play = () => {
            this.startPlay();
            // 移除首次點擊觸發
            document.removeEventListener('click', play);
            document.removeEventListener('touchstart', play);
        };
    
        // 监听用户首次交互来播放
        document.addEventListener('click', play);
        document.addEventListener('touchstart', play);
    }

    // 播放视频的事件
    public startPlay() {
        if (this.videoElement) {
            this.setStateVideoImg(VideoState.Load);
            this.videoElement.play().then(() => {
                console.log('视频已开始播放');
                this.setStateVideoImg(VideoState.Play);
            }).catch((err: any) => {
                cc.error('强制播放视频失败:', err);
            });
        }
    }

    // 取消视频播放的事件
    public cancelPlay() {
        if (this.videoElement && !this.videoElement.paused) {
            this.setStateVideoImg(VideoState.Cancel);
            this.videoElement.pause();
            console.log(`视频暂停于 ${this.videoElement.currentTime} 秒`);
        }
    }

    update() {
        if (!this.videoElement || !this.targetNode) return;

        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const designResolution = canvas.designResolution;
        const nodeBox = this.targetNode.getBoundingBoxToWorld();

        // 获取 canvas 的 DOM 尺寸
        const canvasElement = document.getElementById('GameCanvas') as HTMLCanvasElement;
        if (!canvasElement) return;
        const canvasRect = canvasElement.getBoundingClientRect();

        const scaleX = canvasRect.width / designResolution.width;
        const scaleY = canvasRect.height / designResolution.height;

        const left = nodeBox.x;//nodeBox.x * scaleX + canvasRect.left;
        const top = 0;//(designResolution.height - nodeBox.y - nodeBox.height) * scaleY + canvasRect.top;
        const width = nodeBox.width * scaleX;
        const height = nodeBox.height * scaleY;

        this.videoElement.style.left = `${left}px`;
        this.videoElement.style.top = `${top}px`;
        this.videoElement.style.width = `${width}px`;
        this.videoElement.style.height = `${height}px`;

        // console.warn(`left: ${left}px   top: ${top}px    width: ${width}px    height ${height}px`);
    }

    onDestroy() {
        if (this.flvPlayer) {
            this.flvPlayer.unload();
            this.flvPlayer.detachMediaElement();
            this.flvPlayer.destroy();
            this.flvPlayer = null;
        }

        if (this.videoElement && this.videoElement.parentNode) {
            this.videoElement.pause();
            this.videoElement.src = '';
            this.videoElement.parentNode.removeChild(this.videoElement);
            this.videoElement = null;
        }
    }

    setStateVideoImg(state : VideoState) {
        this.flvPlayerLoadingNode.active = (state == VideoState.Load);
        this.noVideoSprite.active = (state != VideoState.Play);
    }
}

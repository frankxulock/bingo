const { ccclass, property } = cc._decorator;

enum VideoState {
    Init,
    Load,
    Play,
    Cancel,
    Error,
}

@ccclass
export default class FlvPlayer extends cc.Component {
    @property({ tooltip: 'FLV 视频 URL，例如：https://example.com/video.flv' })
    videoUrl: string = 'https://example.com/video.flv';

    @property({ type: cc.Node, tooltip: '跟随的目标节点' })
    targetNode: cc.Node = null;

    @property({ tooltip: '控制视频是否可以交互' })
    isInteractive: boolean = false; // 控制是否显示控制条及交互性

    @property({ type: cc.Node, tooltip: '等待視頻播放顯示的節點' })
    protected flvPlayerLoadingNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: '視頻遮罩節點' })
    protected noVideoSprite: cc.Node = null;

    private flvPlayer: any = null;               // flv.js 播放器實例
    private videoElement: HTMLVideoElement | null = null; // HTML5 video 元素

    // 紀錄先前矩陣與尺寸，避免重複更新
    private _m00 = 0; private _m01 = 0;
    private _m04 = 0; private _m05 = 0;
    private _m12 = 0; private _m13 = 0;
    private _w = 0;   private _h = 0;

    // 快取裝載點 X軸偏移量（paddingLeft）
    private offsetX: number = 0;

    onLoad() {
        // 僅限瀏覽器平台，且 targetNode 必須已設置
        if (!cc.sys.isBrowser || !this.targetNode) {
            cc.warn('FlvPlayer 仅支持 Web，且 targetNode 必须设置。');
            return;
        }

        // 預先取得 offsetX 減少每次計算開銷
        this.offsetX = parseInt(cc.game.container?.style.paddingLeft || '0');

        // 動態載入 flv.js，完成後建立 video 元素
        this.loadFlvJs(() => {
            this.createVideoElement();
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

        // 建立HTML video元素
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('playsinline', ''); // iOS 支持內聯播放
        this.videoElement.setAttribute('muted', '');      // 靜音提高自動播放成功率
        this.videoElement.setAttribute('preload', 'auto');
        this.videoElement.muted = true;
        this.videoElement.controls = this.isInteractive;
        this.videoElement.style.pointerEvents = this.isInteractive ? 'auto' : 'none';

        // 置於後方，zIndex設為負值，且 DOM 位置放在 Canvas 之前
        this.videoElement.style.zIndex = '-1';
        this.videoElement.style.position = 'absolute';
        this.videoElement.style.objectFit = 'fill'; // 填滿容器允許拉伸

        document.body.appendChild(this.videoElement);

        const flvjs = (window as any).flvjs;
        if (flvjs && flvjs.isSupported()) {
            this.flvPlayer = flvjs.createPlayer({
                type: 'flv',
                url: this.videoUrl
            });
            this.flvPlayer.attachMediaElement(this.videoElement);
            this.flvPlayer.load();
            this.startPlay();
        } else {
            cc.error('flv.js 不支持当前浏览器');
        }

        // 監聽畫面尺寸改變，調整 video 位置與大小
        cc.view.setResizeCallback(() => this.updateMatrix());

        this.updateMatrix();
    }

    private addUserInteractionListener(): void {
        const play = () => {
            this.startPlay();
            document.removeEventListener('click', play);
            document.removeEventListener('touchstart', play);
        };

        document.addEventListener('click', play);
        document.addEventListener('touchstart', play);
    }

    public startPlay(retryCount: number = 3) {
        if (!this.videoElement) return;

        this.setStateVideoImg(VideoState.Load);

        this.videoElement.play().then(() => {
            console.log('视频已开始播放');
            this.setStateVideoImg(VideoState.Play);
            console.log("videoUrl : " + this.videoUrl);
        }).catch(err => {
            cc.error('自动播放视频失败:', err);
            if (retryCount > 0) {
                cc.log(`重试播放视频...剩余次数: ${retryCount}`);
                setTimeout(() => this.startPlay(retryCount - 1), 1000);
            } else {
                this.setStateVideoImg(VideoState.Error);
            }
        });
    }

    public cancelPlay() {
        if (this.videoElement && !this.videoElement.paused) {
            this.setStateVideoImg(VideoState.Cancel);
            this.videoElement.pause();
            console.log(`视频暂停于 ${this.videoElement.currentTime} 秒`);
        }
    }

    /**
     * 更新視頻元素的位置和大小，使其跟隨 targetNode 水平位置，
     * 並且垂直方向固定置頂（Y=0）。
     * 只有當 targetNode 的矩陣或尺寸有變化時才更新，提升效能。
     */
    updateMatrix() {
        if (!this.videoElement || !this.targetNode) return;

        const node = this.targetNode;
        const mat4 = cc.mat4();
        node.getWorldMatrix(mat4);

        const camera = cc.Camera['_findRendererCamera']?.(node) || cc.Camera.main;
        if (camera) {
            camera.worldMatrixToScreen(mat4, mat4, cc.game.canvas.width, cc.game.canvas.height);
        }

        const mat = mat4.m;
        const size = node.getContentSize();
        const anchor = node.getAnchorPoint();

        // 比對目前矩陣與尺寸是否有改變
        if (
            this._m00 === mat[0] && this._m01 === mat[1] &&
            this._m04 === mat[4] && this._m05 === mat[5] &&
            this._m12 === mat[12] && this._m13 === mat[13] &&
            this._w === size.width && this._h === size.height
        ) {
            // 沒有變化則跳過更新
            return;
        }

        // 快取新的值
        this._m00 = mat[0]; this._m01 = mat[1];
        this._m04 = mat[4]; this._m05 = mat[5];
        this._m12 = mat[12]; this._m13 = mat[13];
        this._w = size.width; this._h = size.height;

        // 裝置像素比，確保畫面清晰
        const dpr = cc.view.getDevicePixelRatio();
        const scaleX = 1 / dpr;
        const scaleY = 1 / dpr;

        // 計算寬高（按 dpr 縮放）
        const width = size.width * scaleX;
        const height = size.height * scaleY;

        // 取得 canvas 容器的左邊 padding（已快取至 this.offsetX）
        const offsetX = this.offsetX;

        // X 軸位置計算，根據世界矩陣及 anchor 點
        const tx = mat[12] * scaleX - width * mat[0] * anchor.x + offsetX;

        // Y 軸固定置頂，不跟隨 targetNode 垂直位移
        const ty = 0;

        // 拼接 CSS 2D 矩陣變換字串
        const matrix = `matrix(${mat[0] * scaleX},${-mat[1]},${-mat[4]},${mat[5] * scaleY},${tx},${ty})`;

        // 更新 video 元素樣式，改變大小與位置
        const style = this.videoElement.style;
        style.width = `${size.width}px`;
        style.height = `${size.height}px`;
        style.transform = matrix;
        style.webkitTransform = matrix;
        style.transformOrigin = '0 0';
        style.webkitTransformOrigin = '0 0';
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

    /**
     * 根據視頻狀態切換 loading 與遮罩節點顯示
     * @param state 當前視頻狀態
     */
    setStateVideoImg(state: VideoState) {
        this.flvPlayerLoadingNode.active = (state === VideoState.Load);
        this.noVideoSprite.active = (state !== VideoState.Play);
    }
}

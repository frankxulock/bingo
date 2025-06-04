import EventManager, { GameStateUpdate } from '../../Tools/Base/EventManager';
import * as TCPlayerNode from '../component/TcPlayer.js'

const { ccclass, property } = cc._decorator;

/**
 * 本地事件常量定義
 * 用於 FlvPlayer 內部事件通信
 */
const LOCAL_EVENTS = {
    CanvasResize: "CanvasResize",    // Canvas 尺寸變化事件
    VideoUpdate: "VideoUpdate"       // 視頻更新事件
} as const;

/**
 * 視頻播放狀態枚舉
 */
enum VideoState {
    Close,    // 關閉
    Load,     // 載入中
    Play,     // 播放中
}

/**
 * FlvPlayer 視頻播放器組件
 * 負責處理 FLV/HLS/MP4 格式視頻的播放、管理和UI控制
 * 
 * 主要功能：
 * - 多格式視頻播放支持（FLV, HLS, MP4）
 * - 視頻源管理和切換
 * - 自動重試機制
 * - 視頻位置跟隨目標節點
 * - 播放狀態管理
 */
@ccclass
export default class FlvPlayer extends cc.Component {

    // ========== 編輯器可配置屬性 ==========
    
    /** 視頻跟隨的目標節點，視頻會自動跟隨此節點的位置和尺寸 */
    @property({ type: cc.Node, tooltip: '跟随的目标节点' })
    targetNode: cc.Node = null;

    /** 載入狀態顯示節點，播放視頻時的loading提示 */
    @property({ type: cc.Node, tooltip: '等待視頻播放顯示的節點' })
    protected flvPlayerLoadingNode: cc.Node = null;
    
    /** 視頻遮罩節點，無視頻時顯示的背景 */
    @property({ type: cc.Node, tooltip: '視頻遮罩節點' })
    protected noVideoSprite: cc.Node = null;
    
    /** 是否允許用戶與視頻交互（控制面板） */
    @property({ tooltip: '控制视频是否可以交互' })
    isInteractive: boolean = false;

    // ========== 運行時屬性 ==========

    /** 視頻源名稱列表 */
    private videoNames: string[] = [];
    
    /** 視頻URL列表 */
    private videoUrls: string[] = [];
    
    /** 當前播放的視頻URL */
    private url = '';
    
    /** 是否正在播放 */
    private isPlaying = false;
    
    /** 播放器是否準備就緒 */
    private isReady = false;

    // ========== 視頻管理屬性 ==========

    /** 當前播放的視頻索引 */
    private currentVideoIndex: number = 0;
    
    /** 當前重試次數 */
    private retryCount: number = 0;
    
    /** 最大重試次數 */
    private maxRetries: number = 3;

    // ========== TcPlayer 相關屬性 ==========

    /** 當前活動的 TcPlayer 實例 */
    private tcplayer: TCPlayerNode = null;
    
    /** 延遲執行定時器 */
    private timeoutHandler: any;
    
    /** TcPlayer 的 DOM 容器元素 */
    private tcPlayerElement: HTMLElement = null;
    
    /** 視頻 DOM 元素 */
    private videoElement: HTMLElement = null;

    // ========== 矩陣變換緩存變量 ==========
    // 用於優化視頻位置更新，只有當變換矩陣改變時才重新計算

    private _m00: number = 0;    // 矩陣[0][0] - X軸縮放
    private _m01: number = 0;    // 矩陣[0][1] - X軸傾斜
    private _m04: number = 0;    // 矩陣[1][0] - Y軸傾斜
    private _m05: number = 0;    // 矩陣[1][1] - Y軸縮放
    private _m12: number = 0;    // 矩陣[3][0] - X軸位移
    private _m13: number = 0;    // 矩陣[3][1] - Y軸位移
    private _w: number = 0;      // 節點寬度
    private _h: number = 0;      // 節點高度

    // ========== 組件生命週期 ==========

    /**
     * 初始化播放器
     * 設置Canvas透明度、初始化視頻容器、設置事件監聽
     */
    public init(): void {
        // 編輯器模式或非瀏覽器環境下跳過初始化
        if (!cc.sys.isBrowser || CC_EDITOR) return;

        // 確保 Cocos Creator Canvas 背景透明
        try {
            if (cc.Camera?.main) {
                cc.Camera.main.backgroundColor = cc.Color.TRANSPARENT;
            }
            const canvas = document.getElementById('GameCanvas');
            if (canvas) canvas.style.background = 'transparent';
            if (cc.game?.canvas) {
                const ctx = cc.game.canvas.getContext('2d');
                if (ctx) ctx.globalCompositeOperation = 'source-over';
            }
        } catch (error) {
            // 靜默處理錯誤
        }

        // 初始化視頻容器
        this.initVideoContainer();

        // 設置事件監聽器
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_Canvas, this.updateMatrix, this);
        this.isReady = true;
    }

    // ========== 視頻管理方法 ==========

    /**
     * 設置視頻源列表
     * @param urls 視頻URL陣列
     * @param names 視頻名稱陣列（可選）
     */
    public setVideoSources(urls: string[], names?: string[]): void {
        this.videoUrls = urls;
        if (names) this.videoNames = names;
        this.currentVideoIndex = 0;  // 重置到第一個視頻
        this.retryCount = 0;         // 重置重試計數
    }

    /**
     * 播放指定索引的視頻
     * @param index 視頻索引
     * @returns 播放是否成功
     */
    public async playVideoByIndex(index: number): Promise<boolean> {
        // 驗證索引有效性
        if (index < 0 || index >= this.videoUrls.length) {
            return false;
        }

        this.currentVideoIndex = index;
        this.retryCount = 0;
        return await this.playCurrentVideo();
    }

    /**
     * 播放當前索引的視頻
     * @returns 播放是否成功
     */
    public async playCurrentVideo(): Promise<boolean> {
        if (!this.isReady || this.videoUrls.length === 0) return false;

        const url = this.videoUrls[this.currentVideoIndex];
        if (!url) return false;

        try {
            await this.updateUrl(url);
            return true;
        } catch (error) {
            this.handlePlaybackError();
            return false;
        }
    }

    /**
     * 獲取當前視頻信息
     * @returns 當前視頻的詳細信息
     */
    public getCurrentVideoInfo(): { index: number, url: string, name: string } {
        return {
            index: this.currentVideoIndex,
            url: this.videoUrls[this.currentVideoIndex] || '',
            name: this.videoNames[this.currentVideoIndex] || `視頻 ${this.currentVideoIndex + 1}`
        };
    }

    /**
     * 處理播放錯誤，實現自動重試機制
     */
    private handlePlaybackError(): void {
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            setTimeout(() => this.playCurrentVideo(), 2000);
        } else {
            this.retryCount = 0;
        }
    }

    // ========== 初始化方法 ==========

    /**
     * 初始化視頻容器
     * 創建或獲取視頻 DOM 元素，設置樣式和偏移
     */
    private initVideoContainer(): void {
        // 獲取現有容器或創建新容器
        this.tcPlayerElement = document.getElementById('id_test_video');
        if (!this.tcPlayerElement) {
            this.tcPlayerElement = document.createElement('div');
            this.tcPlayerElement.id = 'id_test_video';
            this.tcPlayerElement.className = 'id-test-video';
        }
        
        // 如果容器不在 DOM 中，添加到 body
        if (!this.tcPlayerElement.parentNode) {
            document.body.appendChild(this.tcPlayerElement);
        }
        
        // 設置容器樣式
        Object.assign(this.tcPlayerElement.style, {
            position: "absolute",     // 絕對定位
            zIndex: "-10",           // 置於最底層
            pointerEvents: "none",   // 不響應滑鼠事件
            background: "#000"       // 黑色背景
        });
        
        this.videoElement = this.tcPlayerElement;
    }

    /**
     * 更新視頻元素的位置和大小
     * 使視頻完全跟隨 targetNode 的變換矩陣
     * 使用緩存機制，只有當矩陣或尺寸改變時才更新，提升性能
     */
    updateMatrix(): void {
        if (!this.videoElement || !this.targetNode) return;

        const node = this.targetNode;
        const mat4 = cc.mat4();
        node.getWorldMatrix(mat4);

        // 獲取攝影機並進行座標轉換
        const camera = cc.Camera['_findRendererCamera']?.(node) || cc.Camera.main;
        if (camera) {
            camera.worldMatrixToScreen(mat4, mat4, cc.game.canvas.width, cc.game.canvas.height);
        }

        const mat = mat4.m;
        const nodeWidth = node['_contentSize'].width;
        const nodeHeight = node['_contentSize'].height;
        const anchorX = node['_anchorPoint'].x;
        const anchorY = node['_anchorPoint'].y;

        // 檢查矩陣和尺寸是否有變化（性能優化）
        if (this._m00 === mat[0] && this._m01 === mat[1] && 
            this._m04 === mat[4] && this._m05 === mat[5] &&
            this._m12 === mat[12] && this._m13 === mat[13] &&
            this._w === nodeWidth && this._h === nodeHeight) {
            return; // 沒有變化，跳過更新
        }

        // 更新緩存值
        this._m00 = mat[0];
        this._m01 = mat[1];
        this._m04 = mat[4];
        this._m05 = mat[5];
        this._m12 = mat[12];
        this._m13 = mat[13];
        this._w = nodeWidth;
        this._h = nodeHeight;

        // 計算設備像素比和縮放
        const dpr = cc.view.getDevicePixelRatio();
        const scaleX = 1 / dpr;
        const scaleY = 1 / dpr;

        // 計算變換矩陣參數
        const a = mat[0] * scaleX;
        const b = mat[1];
        const c = mat[4];
        const d = mat[5] * scaleY;

        // 計算容器偏移
        const container = cc.game.container;
        const offsetX = container && container.style.paddingLeft ? parseInt(container.style.paddingLeft) : 0;
        const offsetY = container && container.style.paddingBottom ? parseInt(container.style.paddingBottom) : 0;

        // 獲取Canvas的實際位置
        const canvas = cc.game.canvas;
        const canvasRect = canvas ? canvas.getBoundingClientRect() : { top: 0, left: 0, height : 0 };
        
        // 計算實際尺寸
        const w = this._w * scaleX;
        const h = this._h * scaleY;

        // 計算錨點偏移
        const appx = (w * mat[0]) * anchorX;
        const appy = (h * mat[5]) * anchorY;

        // 計算最終位置 - 考慮Canvas在body中的位置
        const tx = mat[12] * scaleX - appx + offsetX;
        const ty = canvasRect.height - ((mat[13] * scaleY - appy + offsetY) + this._h)

        // 構建CSS變換矩陣
        const matrix = `matrix(${a},${-b},${-c},${d},${tx},${ty})`;

        // 批量更新DOM樣式
        Object.assign(this.videoElement.style, {
            width: `${this._w}px`,
            height: `${this._h}px`,
            transform: matrix,
            webkitTransform: matrix,
            transformOrigin: '0px 100% 0px',
            webkitTransformOrigin: '0px 100% 0px'
        });
    }

    // ========== 播放控制方法 ==========
    
    /**
     * 更新視頻URL並開始播放
     * @param url 視頻URL，為空時停止播放
     */
    public async updateUrl(url: string): Promise<void> {
        this.url = url;
        clearTimeout(this.timeoutHandler);
        
        if (!url) {
            this.stop();
            return;
        }
        
        this.isPlaying = true;
        this.reconnect();
    }

    /**
     * 停止播放並清理資源
     */
    public stop(): void {
        this.isPlaying = false;
        this.clearOldTcPlayer();
        this.setStateVideoImg(VideoState.Close);
    }

    // ========== UI 狀態管理 ==========
    
    /**
     * 根據視頻狀態切換UI顯示
     * @param state 視頻狀態
     */
    private setStateVideoImg(state: VideoState): void {
        const isLoading = state === VideoState.Load;
        const isPlaying = state === VideoState.Play;
        
        // 控制載入狀態顯示
        if (this.flvPlayerLoadingNode) this.flvPlayerLoadingNode.active = isLoading;
        
        // 控制視頻遮罩顯示
        if (this.noVideoSprite) this.noVideoSprite.active = !isPlaying;
    }

    // ========== 事件處理 ==========
    
    /**
     * TcPlayer 事件監聽器
     * 處理播放器的各種事件回調
     */
    private eventListener = (data: any): void => {
        if (!this.tcplayer) return
        switch(data.type) {
            case "load":
                this.updateMatrix();
				this.setStateVideoImg(VideoState.Load);
				// 在 load 事件時設置 tcplayer 引用
				if (data.src.player) {
				    this.tcplayer = data.src.player;
				}
				if (this.tcplayer) {
				    this.tcplayer.volume(0);  // 設置為靜音
				}
				this.isReady = true;
                break;
            case "loadedmetadata":
            case "MetaLoaded":
                // 更新矩陣以適應新的視頻尺寸
                this.updateMatrix();
                
                // 觸發元數據載入事件
                this.node.emit(LOCAL_EVENTS.VideoUpdate, {
                    type: 'loadedmetadata',
                    width: data.src?.videoWidth() || 0,
                    height: data.src?.videoHeight() || 0,
                    duration: data.src?.duration() || 0
                });
                break;
                
            case "loadeddata":
            case "Loaded":
				data?.src?.el && (data.src.el.onpause = 
					() => setTimeout(() => {
						data.src.el.play();
					}, 200));
				break;
				
			case "error":
			    // 即使沒有 tcplayer 實例也要處理錯誤
				this.setStateVideoImg(VideoState.Load);
				clearTimeout(this.timeoutHandler);
				this.timeoutHandler = setTimeout(() => {
					this.reconnect();
				}, 5000);
				break;
				
			case "playing":
				this.setStateVideoImg(VideoState.Play);
				data.src.player.volume(0)
				this.isPlaying && data.src.player.play();
				break;
				
			case "progress":
				this.isPlaying && this.setVideoDisplay(true);
				break;
				
			case "timeupdate":
				clearTimeout(this.timeoutHandler);
				this.isPlaying && this.setVideoDisplay(true);
				break;
				
            case "resize":
                // 當視頻尺寸改變時，重新計算位置矩陣
                this.updateMatrix();
                
                // 觸發自定義 resize 事件給外部監聽器
                this.node.emit(LOCAL_EVENTS.VideoUpdate, {
                    type: 'resize',
                    width: data.src?.videoWidth() || 0,
                    height: data.src?.videoHeight() || 0
                });
                break;
                
            case "pause":
                break;
                
            case "ended":
                break;
                
            case "seeking":
                break;
                
            case "seeked":
                break;
                
            case "volumechange":
                break;
                
            case "canplay":
                break;
                
            case "canplaythrough":
                break;
                
            case "durationchange":
                break;
                
            default:
                break;
        }
    }

    setVideoDisplay(flag: boolean) {
		const visibility: string = flag ? 'visible' : 'hidden';
        this.tcPlayerElement.style.visibility = visibility;
	} 

    // ========== 播放器管理 ==========
    
    /**
     * 重新連接播放器
     * 清理舊播放器並創建新的播放器實例
     */
    private reconnect(): void {
        if (!this.isPlaying) return;

        // 設置UI狀態並清理舊播放器
        this.setStateVideoImg(VideoState.Load);
        this.clearOldTcPlayer();

        // 檢查是否有其他 TcPlayer 實例
        const existingVideos = document.querySelectorAll('video');

        clearTimeout(this.timeoutHandler);
        this.timeoutHandler = setTimeout(() => this.newTcPlayer(), 500);
    }

    /**
     * 創建新的 TcPlayer 實例
     * 根據視頻URL自動檢測格式並配置播放器
     */
    newTcPlayer() {
		this.tcplayer = new TCPlayerNode.TcPlayer('id_test_video', {
			"m3u8": this.url,
			// "flv":this.url,
			"width": '100%',//视频的显示宽度，请尽量使用视频分辨率宽度
			"height": '100%',//视频的显示高度，请尽量使用视频分辨率高度
			"controls": "none",
			"flash": false,
			"live": true,
			"listener": this.eventListener.bind(this),
			"volume": 0,
			"autoplay": true,
			"muted": true,  // 靜音模式確保自動播放
			"preload": "auto",  // 預載入
			"playsinline": true,  // iOS 內聯播放
			h5_flv: true,
			flvConfig: {
				/** 直播追秒啟用 */
				liveBufferLatencyChasing: true,
				/** 最大緩衝區延遲，以秒為單位 */
				liveBufferLatencyMaxLatency: 2,
				/** 最小緩衝延遲，以秒為單位 */
				liveBufferLatencyMinRemain: 1,
			}
		});
		
		// 設置創建後的DOM屬性
		setTimeout(() => {
		    const videoEl = document.querySelector('#id_test_video video') as HTMLVideoElement;
		    if (videoEl) {
		        // 確保DOM元素也設置為靜音
		        videoEl.muted = true;
		        videoEl.volume = 0;
		        videoEl.setAttribute('playsinline', 'true');
		        videoEl.setAttribute('webkit-playsinline', 'true');
		    }
		}, 100);
	}

    /**
     * 清理舊的播放器實例
     * 停止並銷毀所有播放器，清空DOM內容
     */
    clearOldTcPlayer(): void {
        // 停止並銷毀所有播放器實例
        this.tcplayer?.stop();
        this.tcplayer?.destroy();
        
        // 清空DOM容器
        const htmlElement = document.getElementById("id_test_video");
        if (htmlElement?.childElementCount > 0) {
            htmlElement.innerHTML = "";
        }
        
        // 重置播放器引用
        this.tcplayer = null;
    }

    /**
     * 組件銷毀時清理資源
     */
    onDestroy(): void {
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_Canvas, this.updateMatrix, this);
        // 清理播放器實例
        this.clearOldTcPlayer();
        
        // 移除DOM元素
        if (this.tcPlayerElement?.parentNode) {
            this.tcPlayerElement.parentNode.removeChild(this.tcPlayerElement);
            this.tcPlayerElement = null;
        }
        
        // 清理定時器
        clearTimeout(this.timeoutHandler);
    }
}
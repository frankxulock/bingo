/** 
 * @version 2.4.5 
 * @link https://web.sdk.qcloud.com/player/tcplayerlite/release/v2.4.5/TcPlayer-2.4.5.js */
declare class TcPlayer {

    /** 设置音量，不传参则返回当前音量 */
    volume(val?: number): number;

    /** 开始播放视  */
    play(): void;

    /** 通过视频地址加载视频 */
    load(url?: string): void;

    /** 销毁播放器实例 */
    destroy();

    /** 断流播放视频 */
    stop(): void;

    video:any

}
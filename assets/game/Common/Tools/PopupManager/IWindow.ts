/** 獨立視窗功用方法 */
export interface IWindow {
    /** 開啟視窗 */
    open(data?: any): void;
        /** 關閉視窗 */
    close?(): void;
}

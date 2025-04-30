import Singleton from "../Base/Singleton";

/** 廣播事件 */
const { ccclass } = cc._decorator;
@ccclass
export default class EventMag extends Singleton  {
    _eventMap: {} = [];  // 用来存储所有事件及其对应的监听器
    // 注册监听器
    on(eventName, listener, target) {
        if (!this._eventMap[eventName]) {
            this._eventMap[eventName] = [];
        }
        // 添加监听器
        this._eventMap[eventName].push({ listener, target });
    }

    // 移除监听器
    off(eventName, listener, target) {
        if (this._eventMap[eventName]) {
            this._eventMap[eventName] = this._eventMap[eventName].filter(
                item => item.listener !== listener || item.target !== target
            );
        }
    }
    // 广播事件
    emit(eventName, data?) {
        if (this._eventMap[eventName]) {
            // 遍历所有监听器，调用它们
            this._eventMap[eventName].forEach(item => {
                item.listener.call(item.target, data);
            });
        }
    }
}

/** 遊戲狀態事件通知 */
export class GameStateEvent {
    /** 遊戲狀態通知 */
    public static GAME_IDLE = "GAME_IDLE";
    public static GAME_BUY = "GAME_BUY";
    public static GAME_DRAWTHENUMBERS = "GAME_DRAWTHENUMBERS";
    public static GAME_EXTRABALL = "GAME_EXTRABALL";
    public static GAME_REWARD = "GAME_REWARD";
}

/** 遊戲彈跳視窗通知 */
export class GameWindowEvent {

}
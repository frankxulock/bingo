import MegaManager from "./gameMega/MegaManager";

// 賓果遊戲的Controller
const { ccclass, property } = cc._decorator;
@ccclass
export default class BaseUIComponent extends cc.Component {
    protected data : MegaManager = null;

    protected onLoad(): void {
        /** 註冊監聽事件 */
        this.addEventListener();
        /* 初始化流程 */
        this.init();
    }

    protected onDestroy(): void {
        // 遊戲結束
        this.removeEventListener();
    }

    /** 監聽事件（後期根據不同遊戲複寫） */
    protected addEventListener() {}

    /** 監聽事件註銷（後期根據不同遊戲複寫） */
    protected removeEventListener() { }
    
    /** 初始化各種註冊流程（後期根據不同遊戲複寫） */
    protected init(): void { }
}
import MegaDataManager from "./Common/Base/gameMega/MegaDataManager";
import EventManager, { GameStateEvent, GameStateUpdate } from "./Common/Tools/EventManager/EventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UnitTest extends cc.Component {

    private data;
    private btns = [];

    private static _instance: UnitTest = null;
    public static get instance(): UnitTest {
        if (!this._instance) {
            cc.warn("ToastManager 尚未初始化！");
        }
        return this._instance;
    }
    onLoad() {
        if (UnitTest._instance && UnitTest._instance !== this) {
            this.destroy(); // 保證單例唯一
            return;
        }
        UnitTest._instance = this;
    }

    start () {
        this.data = MegaDataManager.getInstance();
        this.btns = this.node.getComponentsInChildren(cc.Button);
        this.btns[0].node.on('click', this.onSnapshot, this)
        this.btns[1].node.on('click', this.onSendBall, this)
        this.btns[2].node.on('click', this.SimulationData_OpenConfirm, this);
        this.btns[3].node.on('click', this.testCardSimulationGeneration, this);
    }

    // 模擬快照封包進入
    onSnapshot() {
        let data = {
            nickName : "caler",                     // 玩家名稱
            coin : 99999,                           // 金額
            currency : "₱",                         // 貨幣單位
            gameState : 1,                          // 1 : 下注時間 2 : 開獎時間 ...
            buyTime : 60,                           // 下注時間
            ballList : [3.51, 25, 98, 12],          // 目前已開球號
            cardInfo : [],                          // 玩家已經購買的卡片
            BingoJackpotAmount : "15263311",   // Ｊackpot金額
            online : 30,                            // 當前在線人數
        }
        this.data.setSnapshot(data);
        EventManager.getInstance().emit(GameStateEvent.GAME_SNAPSHOT);
    }

    onSendBall() {
        /** 模擬Server參數並在DataManager處理完畢 (DataManager負責Server參數轉換成Client可用數值) */
        let data = {
            num : 15,
        }
        this.data.ServerToBallEvent(data);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SendBall);
    }

    /** 卡片數據生成測試 */
    public testCardSimulationGeneration() {
        let data = {
            cardState: 1,
            playState: 2,
            // 1-500 隨機
            readyBuy: Math.floor(Math.random() * 500) + 1, // 1~500
        }
        this.data.setCardState(data.cardState);
        this.SimulationData_OpenConfirm(data);
    }

    /** 模擬Server卡片法送給Client */
    public SimulationData_OpenConfirm(data) {
        const cards = [];
        for (let i = 0; i < data.readyBuy; i++) {
            const cardId = this.generateCardID(i);
            const numbers = this.generateCardNumbersFlat(); // 陣列

            const cardData = {
                cardId: cardId,
                numbers: numbers,
                cardState: data.cardState,
                playState: data.playState,
            };

            cards.push(cardData);
        }
        console.error("卡片數據模擬 =>", cards);
        this.data.ConfirmPurchaseResponse(cards);
    }

    /** 模擬Server處理更新數據 */
    public SnedChangeCardData(data) {
        for(let i = 0; i < data.length; i++) {
            data[i].numbers = this.generateCardNumbersFlat(); // 陣列
        }
        console.log("更新後的卡片數據 => ", data);
        this.data.ConfirmPurchaseResponse(data);
    }

    /** 發送確定購卡請求 */
    public SendPurchaseConfirmation(data) {
        const cardInfo = data.cardInfo;

        this.data.SendPurchasedCardListResponse(cardInfo);
    }

    /** 生成唯一卡片ID（可用時間戳＋索引） */
    private generateCardID(index: number): string {
        return `card_${Date.now()}_${index}`;
    }

    /** 生成賓果卡數據：一維陣列，25 格，中間為 null */
    private generateCardNumbersFlat(): (number | null)[] {
        const getRandom = (range: number[], count: number): number[] =>
            this.shuffle(range).slice(0, count).sort((a, b) => a - b);

        const columns = [
            getRandom(this.range(1, 15), 5),     // B
            getRandom(this.range(16, 30), 5),    // I
            getRandom(this.range(31, 45), 5),    // N
            getRandom(this.range(46, 60), 5),    // G
            getRandom(this.range(61, 75), 5),    // O
        ];

        const flat: (number | null)[] = [];

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                // 中間位置設為 null（自由空格）
                if (row === 2 && col === 2) {
                    flat.push(null);
                } else {
                    flat.push(columns[col][row]);
                }
            }
        }

        return flat;
    }

    /** 工具：範圍陣列 */
    private range(start: number, end: number): number[] {
        return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    }

    /** 工具：洗牌 */
    private shuffle(array: number[]): number[] {
        const result = array.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

import { CardMega } from "./Common/Base/card/cardMega";
import { GAME_STATUS } from "./Common/Base/CommonData";
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
        this.btns[4].node.on('click', this.startSimulation, this);
        this.btns[5].node.on('click', this.TestMegaCard, this);
        this.btns[6].node.on('click', this.TestMegaCardView, this);
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
        this.data.ConfirmPurchaseResponse(cards);
    }

    /** 模擬Server處理更新數據 */
    public SnedChangeCardData(data) {
        for(let i = 0; i < data.length; i++) {
            data[i].numbers = this.generateCardNumbersFlat(); // 陣列
        }
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
            getRandom(this.range(1, 15), 5),    // B
            getRandom(this.range(16, 30), 5),   // I
            getRandom(this.range(31, 45), 5),   // N
            getRandom(this.range(46, 60), 5),   // G
            getRandom(this.range(61, 75), 5),   // O
        ];
    
        const flat: (number | null)[] = [];
 
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                // 中央位置設為 null（第13格）
                if (row === 2 && col === 2) {
                    flat.push(null);
                } else {
                    flat.push(columns[row][col]);
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



    /** 遊戲流程模擬 */
    private isRunning = false;
    private ballInterval = null;
    private betTimer = 5;
    private totalBalls = 49;
    private TestState = GAME_STATUS.LOADING;
    private snedBallTime = 0.5;

    public startSimulation() {
        if (this.isRunning) return;
        this.unscheduleAllCallbacks(); // <-- 保險起見全部清掉
        this.isRunning = true;
        /** // 模擬快照封包 */
        let data = {
            nickName : "caler",                     // 玩家名稱
            coin : 99999,                           // 金額
            currency : "₱",                         // 貨幣單位
            gameState : 1,                          // 1 : 下注時間 2 : 開獎時間 ...
            buyTime : this.betTimer,                           // 下注時間
            ballList : [],                          // 目前已開球號
            cardInfo : [],                          // 玩家已經購買的卡片
            BingoJackpotAmount : "15263311",   // Ｊackpot金額
            online : 30,                            // 當前在線人數
        }
        this.data.setSnapshot(data);
        EventManager.getInstance().emit(GameStateEvent.GAME_SNAPSHOT);

        this.startBettingPhase();
    }

    private startBettingPhase() {
        if (this.TestState === GAME_STATUS.BUY) return;

        this.unscheduleAllCallbacks(); // <-- 保險起見全部清掉
        this.TestState = GAME_STATUS.BUY;
        this.isRunning = true;

        this.data.setGameState(GAME_STATUS.BUY);
        EventManager.getInstance().emit(GameStateEvent.GAME_BUY);
        let countdown = this.betTimer;
        cc.log(`下注階段開始：${countdown}秒`);

        this.schedule(() => {
            countdown--;
            // cc.log(`下注倒數：${countdown}`);
        }, 1, (this.betTimer - 1));

        this.scheduleOnce(() => {
            this.startBallDrawingPhase();
        }, this.betTimer);
    }

    private startBallDrawingPhase() {
        if (this.TestState === GAME_STATUS.DRAWTHENUMBERS) return;
        this.TestState = GAME_STATUS.DRAWTHENUMBERS;
        cc.log("開獎階段開始，開始發球");
        this.data.setGameState(GAME_STATUS.DRAWTHENUMBERS);
        EventManager.getInstance().emit(GameStateEvent.GAME_DRAWTHENUMBERS);
    
        // 建立 1~75 的號碼池並打亂順序
        const availableNumbers: number[] = Array.from({ length: 75 }, (_, i) => i + 1);
        for (let i = availableNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
        }
    
        const drawNumbers = availableNumbers.slice(0, this.totalBalls); // 只取前 49 顆
        let sentBalls = 0;
    
        this.ballInterval = this.schedule(() => {
            if (sentBalls === drawNumbers.length) {
                this.unschedule(this.ballInterval);
                cc.log("發球完畢 結算表演，等待 5 秒重新下注");
                this.TestState = GAME_STATUS.REWARD;
                this.data.setGameState(GAME_STATUS.REWARD);
                this.data.ServerToReward();
                this.scheduleOnce(() => {
                    this.data.GameOver(this.betTimer);
                    this.startBettingPhase();
                }, 5);
                return;
            }
    
            const number = drawNumbers[sentBalls];
            cc.log(`發送球號：${number}`);
            this.data.ServerToBallEvent(number);
            sentBalls++;
        }, this.snedBallTime);
    }
    
    /** 單卡獎金測試 */
    public TestMegaCard() {
        // 固定卡片資訊
        let data = {
            cardId : "12",
            cardState : 0,
            playState : 0,
            numbers : [
                1,       2,     3,      4,      5,
                11,     12,     13,     14,     15,
                21,     22,     null,   24,     25,
                31,     32,     33,     34,     35,
                41,     42,     43,     44,     45,
            ]
        }

        let card = new CardMega(data, null);
        console.warn(this.generateCardNumbersFlat());
        // 用這樣的方式檢查每個中獎圖形
        for(let i = 0; i < 5; i++){
            let v = 1 + i;
            card.updateCard(v);
        }
        for(let i = 0; i < 5; i++){
            let v = 41 + i;
            card.updateCard(v);
        }
        card.updateCard(11);
        card.updateCard(12);
        card.updateCard(14);
        card.updateCard(15);

        card.updateCard(21);
        card.updateCard(25);

        card.updateCard(31);
        card.updateCard(32);
        card.updateCard(34);
        card.updateCard(35);

        console.warn(card);
    }

    public TestMegaCardView() {

        let cardInfo = {
            cardId : 0,
            cardState : 0,
            playState : 0,
            numbers : [
                1,       2,     3,      4,      5,
                11,     12,     13,     14,     15,
                21,     22,     null,   24,     25,
                31,     32,     33,     34,     35,
                41,     42,     43,     44,     45,
            ]
        }
        let cardInfo2 = {
            cardId : 1,
            cardState : 0,
            playState : 0,
            numbers : this.generateCardNumbersFlat(), 
        }
        let card = new CardMega(cardInfo, this.data.cardIconBGs);
        // let card2 = new CardMega(cardInfo2, this.data.cardIconBGs);
        

        let allCardTest = [];
        allCardTest.push(card);
        // allCardTest.push(card2); 
        this.data.SendPurchasedCardListResponse(allCardTest);

        for(let i = 0; i < 5; i++){
            let v = 1 + (i * 10);
            this.data.ServerToBallEvent(v);
        }

        for(let i = 0; i < 4; i++){
            let v = 2 + (i * 10);
            this.data.ServerToBallEvent(v);
        }

        for(let i = 0; i < 5; i++){
            let v = 3 + (i * 10);
            this.data.ServerToBallEvent(v);
        }

        // for(let i = 0; i < 5; i++){
        //     let v = 5 + (i * 10);
        //     this.data.ServerToBallEvent(v);
        // }

        // this.data.ServerToBallEvent(11);
        // this.data.ServerToBallEvent(21);
        // this.data.ServerToBallEvent(31);
        // this.data.ServerToBallEvent(41);
        // this.data.ServerToBallEvent(22);
        // this.data.ServerToBallEvent(24);
        // this.data.ServerToBallEvent(25);
    }
}

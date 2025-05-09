import { CardMega } from "./Common/Base/card/cardMega";
import { CARD_CONTENT, CARD_STATUS, GAME_STATUS } from "./Common/Base/CommonData";
import MegaDataManager from "./Common/Base/gameMega/MegaDataManager";
import EventManager, { GameStateEvent, GameStateUpdate } from "./Common/Tools/Base/EventManager";
import PopupManager from "./Common/Tools/PopupSystem/PopupManager";
import { PopupName } from "./Common/Tools/PopupSystem/PopupConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UnitTest extends cc.Component {

    private data;
    private btns = [];

    private static _instance: UnitTest = null;
    public static get instance(): UnitTest {
        if (!this._instance) {
            cc.warn("尚未初始化！");
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
        this.btns[7].node.on('click', this.OpenResultPage, this);
        this.btns[8].node.on('click', this.OpneRewardPopupPage, this);
        this.btns[9].node.on('click', this.OpneDIYCardSelectionPage, this);
        this.btns[10].node.on('click', this.OpneDIYEditPage, this);
        this.btns[11].node.on('click', this.setAvatarData, this);
        this.btns[12].node.on('click', this.setLeaderboardData, this);
    }

    // 模擬快照封包進入
    onSnapshot() {

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
            cardContent: 0,
            playState: 2,
            // 1-500 隨機
            readyBuy: Math.floor(Math.random() * 500) + 1, // 1~500
        }
        this.data.setCardState(data.cardState);
        this.SimulationData_OpenConfirm(data);
    }

    /** 模擬Server卡片法送給Client 亂數卡片 */
    public SimulationData_OpenConfirm(data) {
        const cards = [];
        for (let i = 0; i < data.readyBuy; i++) {
            const cardId = this.generateCardID(i);
            const numbers = this.generateCardNumbersFlat(); // 陣列

            const cardData = {
                cardId: cardId,
                numbers: numbers,
                cardState: data.cardState,
                cardContent: data.cardContent,
                playState: data.playState,
            };

            cards.push(cardData);
        }
        this.data.ConfirmPurchaseResponse(cards);
        this.setAvatarData();
    }

    /** 模擬Server卡片法送給Client 亂數卡片 */
    public DIYData_OpenConfirm(data) {
        const cards = [];
        for (let i = 0; i < data.cardInfo.length; i++) {
            const cardId = data.cardInfo[i];
            const numbers = data.cardInfo[i].cardInfo; // 陣列

            const cardData = {
                cardId: cardId,
                numbers: numbers,
                cardState: data.cardState,
                cardContent: data.cardContent,
                playState: data.playState,
            };

            cards.push(cardData);
        }
        console.log("DIY Card => ", cards);
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
    public static generateCardID(): string {
        return `card_${Date.now()}_0`;
    }
    public generateCardID(index: number): string {
        return `card_${Date.now()}_${index}`;
    }


    /** 生成賓果卡數據：一維陣列，25 格，中間為 null */
    public generateCardNumbersFlat(): (number | null)[] {
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
    public range(start: number, end: number): number[] {
        return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    }

    /** 工具：洗牌 */
    public shuffle(array: number[]): number[] {
        const result = array.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /** 工具：隨機中獎球號 */
    public generateRandomWinData(): Map<number, number> {
        let numberMap : Map<number, number> = new Map();
        for (let ballNumber = 1; ballNumber <= 75; ballNumber++) {
            const winCount = Math.floor(Math.random() * 51); // 0 to 50
            numberMap.set(ballNumber, winCount);
        }
        return numberMap;
    }



    /** 遊戲流程模擬 */
    private isRunning = false;
    private ballInterval = null;
    private betTimer = 2;
    private totalBalls = 49;
    private TestState = GAME_STATUS.LOADING;
    private snedBallTime = 1;

    public startSimulation() {
        this.btns[4].active = false;
        if (this.isRunning) return;
        this.unscheduleAllCallbacks(); // <-- 保險起見全部清掉
        this.isRunning = true;
        /** // 模擬快照封包 */
        let data = {
            nickName : "caler",                     // 玩家名稱
            coin : 9999999,                           // 金額
            currency : "₱",                         // 貨幣單位
            gameState : 1,                          // 1 : 下注時間 2 : 開獎時間 ...
            buyTime : this.betTimer,                           // 下注時間
            ballList : [],                          // 目前已開球號
            cardInfo : [],                          // 玩家已經購買的卡片
            BingoJackpotAmount : "15263311",   // Ｊackpot金額
            online : 30,                            // 當前在線人數
            ballNumberWinMap: this.generateRandomWinData(),                   // 每個球的中獎次數
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

            // extra patterns獎勵事件
            if(sentBalls === 44) {
                this.OpneRewardPopupPage();
            }

            // 49球結算事件
            if (sentBalls === drawNumbers.length) {
                this.unschedule(this.ballInterval);
                cc.log("發球完畢 結算表演，等待 5 秒重新下注");
                this.TestState = GAME_STATUS.REWARD;
                this.data.setGameState(GAME_STATUS.REWARD);
                this.OpenResultPage();
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
        }, this.snedBallTime, this.totalBalls);
    }
    
    /** 單卡獎金測試 */
    public TestMegaCard() {
        // 固定卡片資訊
        let data = {
            cardId : "12",
            cardState : 0,
            cardContent: 0,
            playState : 0,
            numbers : [
                1,       2,     3,      4,      5,
                11,     12,     13,     14,     15,
                21,     22,     null,   24,     25,
                31,     32,     33,     34,     35,
                41,     42,     43,     44,     45,
            ]
        }

        let card = new CardMega(data);
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
            cardContent: 0,
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
            cardContent: 0,
            playState : 0,
            numbers : this.generateCardNumbersFlat(), 
        }
        let card = new CardMega(cardInfo);
        // let card2 = new CardMega(cardInfo2);
        
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

    private OpenResultPage() {
        PopupManager.showPopup(PopupName.ResultPage, this.data.getResultPageData());
    }

    private OpneRewardPopupPage() {
        PopupManager.showPopup(PopupName.RewardPopupPage, this.data.getRewardPopupData());
    }

    /** DIY購卡頁面 */
    private OpneDIYCardSelectionPage() {
        this.data.setCardContent(CARD_CONTENT.DIY);
        this.DIYRandomlyGeneratedCard();
        PopupManager.showPopup(PopupName.DIYCardSelectionPage, this.data.getDIYCardSelectionData());
    }

    /** DIY編輯頁面 */
    private OpneDIYEditPage() {
        this.data.setballNumberWinMap(this.generateRandomWinData());

        PopupManager.showPopup(PopupName.DIYEditPage, this.data.getDIYEditData());
    }

    /** 隨機生成卡片測試功能 */
    public RandomlyGeneratedCard() {
        const cards = [];
        const count = Math.floor(Math.random() * 60) + 1; // 隨機 1~60
    
        for (let i = 0; i < count; i++) {
            const cardId = this.generateCardID(i);
            const numbers = this.generateCardNumbersFlat(); // 陣列
    
            const cardData = {
                cardId: cardId,
                numbers: numbers,
                cardState: 1,
                cardContent: 0,
                playState: 0,
            };
    
            cards.push(cardData);
        }
    
        const allCardTest = cards.map(cardData => new CardMega(cardData));
        this.data.SendPurchasedCardListResponse(allCardTest);
    }    

    /** 隨機收藏DIY卡片測試功能 */
    public DIYRandomlyGeneratedCard() {
        const cards = [];
        const count = Math.floor(Math.random() * 60) + 1; // 隨機 1~60
    
        for (let i = 0; i < count; i++) {
            const cardId = this.generateCardID(i);
            const numbers = this.generateCardNumbersFlat(); // 陣列
    
            const cardData = {
                cardId: cardId,
                numbers: numbers,
                cardState: 1,
                cardContent: 1,
                playState: 0,
            };
    
            cards.push(cardData);
        }
    
        const allCardTest = cards.map(cardData => new CardMega(cardData));

        const sampleCount = 10;
        // 打亂陣列
        const shuffled = allCardTest.sort(() => 0.5 - Math.random()); 
        // 取前 N 筆（如果總數少於 N，就取全部）
        const selectedCards = shuffled.slice(0, Math.min(sampleCount, shuffled.length));
        
        this.data.SendPurchasedCardListResponse(selectedCards);
        this.data.setDIYCardList(allCardTest);
    } 

    private setAvatarData() {
        const data: any[] = [];
        const count = Math.floor(Math.random() * 14) + 2; // 2~15 筆
    
        for (let i = 0; i < count; i++) {
            const fbID = (100000 + Math.floor(Math.random() * 900000)).toString();
            const hostName = `Host_${i + 1}`;
            const hostImage = `https://picsum.photos/150/150?random=${Math.floor(Math.random() * 9) + 1}`; // 隨機大頭貼
            const host = {
                hostIcon: hostImage,
                hostImage: hostImage,
                hostName: hostName,
                from: "Form: Earth",
                birthday: "Dec " + (Math.floor(Math.random() * 28) + 1),
                favorote: "Music",
                fbName: hostName,
                fbID: fbID,
            };
            data.push(host);
        }

        this.data.setAvatarData(data);
    }

    private setLeaderboardData() {

        let JPRanking = [
            {
                name : "Deplk001",
                ball : [2, 5, 15],  //最多三顆 1-75
                num : 21,           // 0-25
                BuyCard: 2,         // 1-500
            }
        ]

        let data = {
            JPRanking: this.getRanking(),
            JPHistory: this.getHistory(true),
            EPRanking: this.getRanking(),
            EPHistory: this.getHistory(false),
        }
        this.data.setLeaderboardData(data);
    }

    getRanking(): any[] {
        const Ranking = [];
    
        const total = Math.floor(Math.random() * 200) + 1; // 1~200 筆
    
        for (let i = 0; i < total; i++) {
            const name = `User${String(i + 1).padStart(3, '0')}`;
    
            const ballCount = Math.floor(Math.random() * 3) + 1; // 1~3 顆球
            const ball = Array.from({ length: ballCount }, () =>
                Math.floor(Math.random() * 75) + 1
            );
            const imgae = "";
    
            const entry = {
                imgae,
                name,
                ball,
                num: Math.floor(Math.random() * 26),       // 0~25
                BuyCard: Math.floor(Math.random() * 500) + 1 // 1~500
            };
    
            Ranking.push(entry);
        }
    
        return Ranking;
    }

    getHistory(IsJP: boolean): any[] {
        // 隨機名稱生成器
        const randomName = () => {
            const names = ["Deplk001", "KuroTan", "User123", "Gamer456", "Player789"];
            return names[Math.floor(Math.random() * names.length)];
        };
    
        // 隨機金額生成器 (500 - 9999999)
        const randomAmount = () => {
            return Math.floor(Math.random() * (9999999 - 500 + 1)) + 500;
        };
    
        // 隨機日期生成器 (格式：MM/DD/YYYY)
        const randomDate = () => {
            const start = new Date(2020, 0, 1); // 開始日期 2020-01-01
            const end = new Date(); // 今天
            const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
            const date = new Date(randomTime);
            return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        };
    
        let JPHistory = [];
        let EPHistory = [];
        
        // 隨機產生 JPHistory 或 EPHistory
        for (let i = 0; i < 30; i++) {
            // 如果是 JP，則加入 date
            if (IsJP) {
                let data = {
                    name : randomName(),
                    amount : randomAmount(),
                    date : randomDate()
                };
                JPHistory.push(data);
            } else {
                let data = {
                    name : randomName(),
                    amount : randomAmount(),
                };
                EPHistory.push(data);
            }
        }
    
        // 根據 IsJP 返回不同的歷史紀錄
        return IsJP ? JPHistory : EPHistory;
    }
}

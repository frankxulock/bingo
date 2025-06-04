import EventManager, { GameStateEvent, GameStateUpdate } from "../Tools/Base/EventManager";
import Singleton from "../Tools/Base/Singleton";
import { GAME_STATUS } from "./CommonData";
import MegaManager from "./gameMega/MegaManager";

/**
 * WebSocket 主題類型枚舉
 */
enum WsTopicType {
    MBan = 'MBan',
    Online = 'online',
    PrizePotRecord = 'prizepot.record',
    PlayerLock = 'player.lock',
    OrderCurrent = 'order.current',
    UserInfo = 'user.info',
    ExtraMega = 'extra.mega',
    RankMega = 'rank.mega',
    WinNoticeMega = 'win.notice.mega',
    PrizePotBGM = 'prize.pot.BGM',
    MegaEvent = 'mega.event',
    MegaCountdown = 'mega.countdown'
}

/**
 * WebSocket 事件類型枚舉
 */
enum WsEventType {
    UserInfoUpdate = 26,
    BanStatusChange = 1,
    OnlineStatusChange = 2,
    PrizePotUpdate = 3,
    OrderStatusChange = 4,
    RankUpdate = 5,
    WinNotice = 6
}

/**
 * WebSocket 錯誤類型枚舉
 */
enum WsErrorType {
    ParseError = 'PARSE_ERROR',
    ConnectionError = 'CONNECTION_ERROR',
    UnknownTopic = 'UNKNOWN_TOPIC',
    UnknownEventType = 'UNKNOWN_EVENT_TYPE',
    InvalidData = 'INVALID_DATA'
}

/**
 * WebSocket 錯誤類
 */
class WsError extends Error {
    constructor(
        public type: WsErrorType,
        public details: any,
        message: string
    ) {
        super(message);
        this.name = 'WsError';
    }
}

export class SocketManager extends Singleton {
    private socket: WebSocket;
    private data: MegaManager;
    private pingTimer: any;
    private sidCounter = 1;

    connect(url : string) {
        this.data = MegaManager.getInstance();
        this.socket = new WebSocket(url);
        this.socket.binaryType = "arraybuffer";

        this.socket.onopen = () => {
            console.log("✅ WebSocket opened");
        };

        this.socket.onmessage = (event) => {
            const data = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data);
            this.handleServerMessage(data);
        };

        this.socket.onclose = () => {
            console.warn("❎ WebSocket closed");
            this.stopPing();
        };

        this.socket.onerror = (err) => {
            console.error("💥 WebSocket error:", err);
        };
    }

    // 統一發送消息的方法
    private sendMessage(message: string, isPingPong: boolean = false) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const encoded = new TextEncoder().encode(message);
            this.socket.send(encoded);
            if (!isPingPong) {
                console.log("📤 Sent message:", message.trim());
            }
        } else {
            console.warn("⚠️ WebSocket 尚未開啟，無法發送");
        }
    }

    /** 發送連線通知 */
    private sendConnect(user : string, pass : string) {
        const conn = {
            no_responders: true,
            protocol: 1,
            verbose: false,
            pedantic: false,
            user: user,
            pass: pass,
            lang: "nats.ws",
            version: "1.30.3",
            headers: true
        };
        this.sendMessage(`CONNECT ${JSON.stringify(conn)}\r\n`);
        this.startPing();
        this.sendInitPacket();
    }

    /** 發送訂閱通知 */
    sendInitPacket() {
        const merchant_id = window.serverData.infoLock.merchant_id;
        const user_id = window.serverData.infoLock.user_id;
        const gameRoundID = window.serverData.id.game_round_id;

        const subs = [
            [`WsUser.${merchant_id}.MBan`, 1],
            [`WsUser.${merchant_id}.online`, 2],
            [`WsUser.${merchant_id}.${user_id}.prizepot.record`, 3],
            [`WsUser.${merchant_id}.${user_id}.player.lock`, 4],
            [`WsUser.${merchant_id}.${user_id}.order.current`, 5],
            [`WsUser.${merchant_id}.${user_id}.user.info`, 6],
            [`WsUser.${merchant_id}.extra.mega`, 7],
            [`WsUser.${merchant_id}.rank.mega`, 8],
            [`WsUser.win.notice.mega.${merchant_id}.${user_id}`, 9],
            [`WsUser.prize.pot.BGM`, 10],
            [`WsUser.prize.pot.BGM.${merchant_id}`, 11],
            [`WsUser.mega.event`, 12],
            [`WsUser.mega.countdown`, 13]
        ];
        const pubs = [
            ["WsUser.query.gameEvent", {
                merchant_id: merchant_id,
                user_id: user_id,
                game_code: window.url.getGame(), // "BGM"
            }],
            ["WsUser.query.welcome", {
                merchant_id: merchant_id,
                user_id: user_id,
                period: gameRoundID
            }],
            ["WsUser.query.order.eb.verify", {
                merchant_id: merchant_id,
                user_id: user_id,
            }]
        ];

        let fullStr = "";

        // SUB 指令
        subs.forEach(([subject, sid]) => {
            fullStr += `SUB ${subject} ${sid}\r\n`;
        });

        // PUB 指令
        pubs.forEach(([subject, payload]) => {
            const payloadStr = JSON.stringify(payload);
            const payloadLen = new TextEncoder().encode(payloadStr).length;
            fullStr += `PUB ${subject} ${payloadLen}\r\n${payloadStr}\r\n`;
        });

        this.sendMessage(fullStr);
    }

    /**
     * 處理來自伺服器的原始訊息
     */
    private handleServerMessage(msg: string) {
        if (msg.startsWith("INFO")) {
            // 初次連線後收到 INFO，發送 CONNECT 命令建立身份
            this.sendConnect("bingonatscli", "2wvbthbbescDw0Fyky");
        } else if (msg.startsWith("PING")) {
            // NATS 心跳訊號，回傳 PONG 維持連線
            this.sendMessage("PONG\r\n", true);
        } else if (msg.startsWith("MSG")) {
            // 處理實際推播資料
            const lines = msg.split("\r\n");  // NATS MSG 結構為 header + payload
            const [header, payload] = lines;
            const parts = header.split(" ");
            const subject = parts[1]; // e.g. "WsUser.mega.event"
            try {
                const json = JSON.parse(payload); // 將 payload 解析為 JSON
                this.processServerEvent(subject, json); // 進一步處理事件資料
            } catch (err) {
                console.warn("❗ 無法解析伺服器資料:", err);
            }

        } else {
            // 其他非標準類型訊息（例如非 PONG 的錯誤訊息或未知訊息）
            if (!msg.startsWith("PONG")) {
                console.log("📩 Server:", msg.trim());
            }
        }
    }

    /**
     * 根據伺服器主題 (subject) 路由不同事件處理邏輯
     */
    private processServerEvent(subject: string, json: any) {
        try {
            const type = json.type;       // 事件類型代號
            const data = json.data;       // 事件資料主體
            const timestamp = json.time;  // 傳送時間戳

            // 只對特定事件進行日誌輸出
            // if (!subject.includes(WsTopicType.Online) && 
            //     !subject.includes(WsTopicType.RankMega) &&
            //     !(subject.includes(WsTopicType.UserInfo) && type === 26) &&
            //     !subject.includes(WsTopicType.MegaCountdown) &&
            //     !(subject.includes(WsTopicType.OrderCurrent) && type === 25)
            // ) {
                console.log(`📨 收到消息 - 主題: ${subject}, 類型: ${type}, 資料: `, data);
            // }

            // 根據主題類型分發到對應的處理方法
            if (subject.includes(WsTopicType.MegaEvent) || subject.includes(WsTopicType.MegaCountdown)) {
                this.handleMegaEvent(subject, type, data, timestamp);
            } else if (subject.includes(WsTopicType.UserInfo)) {
                this.handleUserInfo(type, data);
            } else if (subject.includes(WsTopicType.MBan)) {
                this.handleBanStatus(type, data);
            } else if (subject.includes(WsTopicType.Online)) {
                this.handleOnlineStatus(type, data);
            } else if (subject.includes(WsTopicType.PrizePotRecord)) {
                this.handlePrizePotRecord(type, data);
            } else if (subject.includes(WsTopicType.OrderCurrent)) {
                this.handleOrderCurrent(type, data);
            } else if (subject.includes(WsTopicType.RankMega)) {
                this.handleRankMega(type, data);
            } else if (subject.includes(WsTopicType.WinNoticeMega)) {
                this.handleWinNotice(type, data);
            } else if (subject.includes(WsTopicType.PrizePotBGM)) {
                this.handlePrizePotBGM(type, data);
            } else if (subject.endsWith('extra.mega')) {
                this.handleExtraMega(type, data);
            } else {
                throw new WsError(
                    WsErrorType.UnknownTopic,
                    { subject, type },
                    `未知的主題: ${subject}`
                );
            }
        } catch (error) {
            if (error instanceof WsError) {
                console.error(`🚨 WebSocket錯誤: ${error.message}`, error);
            } else {
                console.error(`🚨 處理消息時發生未知錯誤:`, error);
            }
            // 可以在這裡添加錯誤報告或重試邏輯
        }
    }

    /**
     * 處理用戶信息相關事件
     */
    private handleUserInfo(type: number, data: any) {
        try {
            switch(type) {
                case WsEventType.UserInfoUpdate:
                    const coin = Number(data);
                    if (isNaN(coin)) {
                        throw new WsError(
                            WsErrorType.InvalidData,
                            { data },
                            '無效的金幣數據'
                        );
                    }
                    this.data.setCoin(coin);
                    //console.log(`💰 用戶金幣更新: ${coin}`);
                    break;
                default:
                    throw new WsError(
                        WsErrorType.UnknownEventType,
                        { type },
                        `未知的用戶信息事件類型: ${type}`
                    );
            }
        } catch (error) {
            console.error(`🚨 處理用戶信息時發生錯誤:`, error);
            throw error;
        }
    }

    /**
     * 處理封禁狀態相關事件
     */
    private handleBanStatus(type: number, data: any) {
        try {
            console.log(`🚫 處理封禁狀態 - 類型: ${type}`, data);
            // 實現封禁狀態處理邏輯
        } catch (error) {
            console.error(`🚨 處理封禁狀態時發生錯誤:`, error);
            throw error;
        }
    }

    /**
     * 處理在線狀態相關事件
     */
    private handleOnlineStatus(type: number, data: any) {
        try {
            // console.log(`👥 處理在線狀態 - 類型: ${type}`, data);
            // 實現在線狀態處理邏輯
            this.data.setOnline(data);
        } catch (error) {
            console.error(`🚨 處理在線狀態時發生錯誤:`, error);
            throw error;
        }
    }

    /**
     * 處理獎池記錄相關事件
     */
    private handlePrizePotRecord(type: number, data: any) {
        try {
            console.log(`🏆 處理獎池記錄 - 類型: ${type}`, data);
            // 實現獎池記錄處理邏輯
        } catch (error) {
            console.error(`🚨 處理獎池記錄時發生錯誤:`, error);
            throw error;
        }
    }

    /**
     * 處理當前訂單相關事件
     */
    private handleOrderCurrent(type: number, data: any) {
        try {
            // console.log(`📋 處理當前訂單 - 類型: ${type}`, data);
            // 實現當前訂單處理邏輯
        } catch (error) {
            console.error(`🚨 處理當前訂單時發生錯誤:`, error);
            throw error;
        }
    }

    /**
     * 處理排名相關事件
     */
    private handleRankMega(type: number, data: any) {
        try {
            switch(type) {
                case 5:         // Jackpot實質玩法排行榜
                    // 因為目前Jackpot遊戲排行至45球後就停止且內容跟bingo一樣所以先使用bingoq排行做更新
                    break;
                case 10:        // Bingo實質玩法排行榜
                    this.data.updateCurrentJPRanking(data);
                    break;
                default:
                    console.log(`🏅 未處理排名信息 - 類型: ${type}`, data);
                    break;
            }
        } catch (error) {
            console.error(`🚨 處理排名信息時發生錯誤:`, error);
            throw error;
        }
    }

    /**
     * 處理中獎通知相關事件
     */
    private handleWinNotice(type: number, data: any) {
        try {
           switch(type) {
                case 9:         // 總結算
                    this.data.ResultComplete(data);
                    break;
                default:
                    console.log(`🎉 未處理中獎通知 - 類型: ${type}`, data);
                    break;
            }
        } catch (error) {
            console.error(`🚨 處理中獎通知時發生錯誤:`, error);
            throw error;
        }
    }

    /**
     * 處理 BGM 獎池相關事件
     * @param type - 事件類型
     * @param data - 獎池數據
     */
    private handlePrizePotBGM(type: number, data: any) {
        try {
            if (!data || typeof data !== 'object') {
                throw new WsError(
                    WsErrorType.InvalidData,
                    { data },
                    'BGM獎池數據格式無效'
                );
            }

            // 更新獎池數據
            this.data.updatePrizePot(data);
            // console.log(`💰 BGM獎池更新 - 類型: ${type}`, data);
        } catch (error) {
            console.error(`🚨 處理BGM獎池數據時發生錯誤:`, error);
            throw error;
        }
    }

    /**
     * 處理 Extra Mega 相關事件
     */
    private handleExtraMega(type: number, data: any) {
        try {
            switch(type) {
                case 6:     // extra實質排行版數據
                    this.data.updateCurrentEPRanking(data);
                    break;
                default:
                    console.warn(`🚨 未處理 Extra Mega type:`, type + `   data : `, data);
                    break;
            }
            // this.data.updateExtraMega(data);
        } catch (error) {
            console.error(`🚨 處理 Extra Mega 數據時發生錯誤:`, error);
            throw error;
        }
    }

    /**
     * 處理 Mega 遊戲模組相關的事件資料
     * @param subject - 主題名稱 (e.g. "WsUser.mega.event" or "WsUser.mega.countdown")
     * @param type - 事件類型 ID（定義事件性質）
     * @param data - 資料主體
     * @param timestamp - 訊息時間戳
     */
    private handleMegaEvent(subject: string, type: number, data: any, timestamp: number) {
        switch (subject) {
            case "WsUser.mega.event":
                this.handleMegaEventType(type, data, timestamp);
                break;
            case "WsUser.mega.countdown":
                this.handleMegaCountdown(data);
                break;
            default:
                console.warn("❗ 未支援的 Mega 主題:", subject);
                break;
        }
    }

    /**
     * 處理一般遊戲事件，如獎號開始、結算、遊戲結束等
     */
    private handleMegaEventType(type: number, data: any, timestamp: number) {
        // type 固定為 3，根據 game_event 判斷遊戲狀態
        switch (data.game_event) {
            case "begin":
                // 新局開始
                this.data.NewGame(data);
                break;

            case "prize_on_going":
                // 開獎中
                this.data.PrizeOnGoingEvent(data);
                break;

            case "finish":
                // 遊戲結束
                this.data.GameOver();
                break;

            default:
                console.warn("🔶 未知的遊戲事件:", data.game_event, data);
                break;
        }
    }

    /**
     * 處理倒數時間推播（單獨的 countdown 主題）
     */
    private handleMegaCountdown(data: any) {
        // 取出倒數秒數，預設為 0，如果資料格式錯誤也不會 crash
        const seconds = typeof data.count_down === "number" ? data.count_down : 0;
        // console.log(`⏳ 倒數計時中：${seconds} 秒`);
        EventManager.getInstance().emit(GameStateUpdate.StaticUpdate_Countdown, seconds);
        if(seconds <= 0) {
            this.data.ReawtheNumbers();
        }
    }


    private startPing() {
        this.pingTimer = setInterval(() => {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.sendMessage("PING\r\n", true);
            }
        }, 4000);
    }

    private stopPing() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    /**
     * 訂閱主題
     */
    subscribe(subject: string, sid?: number) {
        const realSid = sid ?? this.sidCounter++;
        this.sendMessage(`SUB ${subject} ${realSid}\r\n`);
        console.log(`📥 SUB ${subject} ${realSid}`);
    }

    /**
     * 發送 PUB 指令
     */
    publish(subject: string, payload: object) {
        const payloadStr = JSON.stringify(payload);
        const payloadLen = new TextEncoder().encode(payloadStr).length;
        const msg = `PUB ${subject} ${payloadLen}\r\n${payloadStr}\r\n`;
        this.sendMessage(msg);
        console.log(`📤 PUB ${subject}`, payload);
    }

    close() {
        this.stopPing();
        this.socket.close();
    }
}

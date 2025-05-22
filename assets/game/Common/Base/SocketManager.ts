import EventManager, { GameStateEvent, GameStateUpdate } from "../Tools/Base/EventManager";
import Singleton from "../Tools/Base/Singleton";
import { GAME_STATUS } from "./CommonData";
import MegaManager from "./gameMega/MegaManager";

/**
 * Mega 遊戲伺服器事件類型定義
 */
enum MegaEventType {
    CountdownStart = 1,    // 遊戲倒數階段開始
    PrizeOnGoing   = 3,    // 獎號開獎進行中
    GameFinished   = 5     // 遊戲結束，等待下一輪
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
        const type = json.type;       // 事件類型代號
        const data = json.data;       // 事件資料主體
        const timestamp = json.time;  // 傳送時間戳（可選）
        if (subject.startsWith("WsUser.mega.")) {
            // 所有屬於 Mega 模組的事件都統一交給這裡處理
            this.handleMegaEvent(subject, type, data, timestamp);
        } else if(subject.endsWith("user.info")) {
            this.userInfo(subject, type, data, timestamp);
        } else if(subject.endsWith("order.current")) {
            // console.warn("📭 未處理的主題:", subject, "  type : ", type + "   data: ", data);
        }else {
            console.warn("📭 未處理的主題:", subject, "  type : ", type + "   data: ", data);
        }
    }

    /**
     * 處理 玩家資訊 模組相關的事件資料
     * @param subject - 主題名稱 
     * @param type - 事件類型 ID（定義事件性質）
     * @param data - 資料主體
     * @param timestamp - 訊息時間戳
     */
    private userInfo(subject: string, type: number, data: any, timestamp: number) {
        switch(type){
            case 26:
                let coin = Number(data);
                this.data.setCoin(coin);
                break;
            default:
                console.warn("🔶 未知的 user Type:", type, data);
                break;
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
        switch (type) {
            case MegaEventType.CountdownStart:
                console.log("⏳ 遊戲倒數階段開始", data);
                break;

            case MegaEventType.PrizeOnGoing:
                console.log("🎯 獎號進行中", data);
                this.data.PrizeOnGoingEvent(data);
                break;

            case MegaEventType.GameFinished:
                console.log("🏁 遊戲結束，等待下一輪", data);
                break;

            default:
                console.warn("🔶 未知的 MegaEvent Type:", type, data);
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
            this.data.setGameState(GAME_STATUS.REWARD);
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

import BaseSingletonComponent from "../../Common/Tools/Base/BaseSingletonComponent";

const { ccclass, property } = cc._decorator;

/*** 公用圖片與資訊設定管理處 */
@ccclass
export default class BingoMegaUI extends BaseSingletonComponent {

    @property({ type: [cc.SpriteFrame], visible: true })
    private ballBG: cc.SpriteFrame[] = [];

    @property({ type: [cc.SpriteFrame], visible: true })
    protected cardIconBGs: cc.SpriteFrame[] = [];

    @property({ type: [cc.SpriteFrame], visible: true })
    protected leaderboardBG: cc.SpriteFrame[] = [];
    @property({ type: [cc.SpriteFrame], visible: true })
    protected userIcon: cc.SpriteFrame[] = [];
    @property({ type: [cc.SpriteFrame], visible: true })
    protected dengji: cc.SpriteFrame[] = [];

    public static getInstance(): BingoMegaUI {
        return this._getInstance(BingoMegaUI);
    }

    /** 取得所有卡牌背景 */
    public getAllCardIconBG(): cc.SpriteFrame[] {
        return this.cardIconBGs;
    }

    /** 取得卡牌背景 */
    public getCardIconBG(index: number): cc.SpriteFrame {
        return this.cardIconBGs[index] || null;
    }

    /** 取得球背景 */
    public getBallBG(index: number): cc.SpriteFrame {
        return this.ballBG[index] || null;
    }

    /** 
     * 根據名次索引安全地取得陣列項目（最大限制為 index 3）
     * @param list 要查詢的 SpriteFrame 陣列
     * @param index 排名索引
     * @returns 陣列中對應的 SpriteFrame 或 null
     */
    private getSafeSpriteFrame(list: cc.SpriteFrame[], index: number): cc.SpriteFrame {
        const safeIndex = Math.min(index, 3);
        return list[safeIndex] || null;
    }

    /** 🎖 取得排行榜背景圖片 */
    public getLeaderboardBG(index: number): cc.SpriteFrame {
        return this.getSafeSpriteFrame(this.leaderboardBG, index);
    }

    /** 👤 取得預設排行榜玩家頭像 */
    public getUserIcon(index: number): cc.SpriteFrame {
        return this.getSafeSpriteFrame(this.userIcon, index);
    }

    /** 🥇 取得名次徽章（等級圖示） */
    public getDengjiIcon(index: number): cc.SpriteFrame {
        return this.getSafeSpriteFrame(this.dengji, index);
    }
}

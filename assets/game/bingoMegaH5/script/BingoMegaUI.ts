import BaseSingletonComponent from "../../Common/Tools/Base/BaseSingletonComponent";

const { ccclass, property } = cc._decorator;

/** 公用圖片與資訊設定管理處 */
@ccclass
export default class BingoMegaUI extends BaseSingletonComponent {

    @property({ type: cc.SpriteAtlas, visible: true })
    private allAsset: cc.SpriteAtlas = null;

    private BallBGStr: string[] = [
        'balls-blue',
        'balls-red',
        'balls-orange',
        'balls-green',
        'balls-yellow',
    ];

    private leaderboardBGStr: string[] = [
        'Leaderboard-list-leaderboard-1',
        'Leaderboard-list-leaderboard-2',
        'Leaderboard-list-leaderboard-3',
        'Leaderboard-list-leaderboard-normal',
    ];

    private userIconStr: string[] = [
        'Leaderboard-UserIcon1',
        'Leaderboard-UserIcon2',
        'Leaderboard-UserIcon3',
        'Leaderboard-UserIcon4',
    ];

    private dengjiStr: string[] = [
        'Leaderboard-dengji01',
        'Leaderboard-dengji02',
        'Leaderboard-dengji03',
        'Leaderboard-dengji04',
    ];

    private cardBGStr: string[] = [
        'card-uncheckedBG',
        'card-checkedBG',
        'card-pre_card_BG',
    ];

    protected cardIconBGs: cc.SpriteFrame[] = [];
    private userIcon: cc.SpriteFrame[] = [];
    private dengji: cc.SpriteFrame[] = [];

    public static getInstance(): BingoMegaUI {
        return this._getInstance(BingoMegaUI);
    }

    protected onLoad(): void {
        super.onLoad();
        // 初始化排行榜玩家頭像
        this.userIcon = this.userIconStr.map(name => this.allAsset?.getSpriteFrame(name) || null);

        // 初始化排行榜等級徽章
        this.dengji = this.dengjiStr.map(name => this.allAsset?.getSpriteFrame(name) || null);

        // 如果有卡牌背景也可以這樣初始化：
        this.cardIconBGs = this.cardBGStr.map(name => this.allAsset?.getSpriteFrame(name) || null);
    }

    /** 取得所有卡牌背景 */
    public getAllCardIconBG(): cc.SpriteFrame[] {
        return this.cardIconBGs;
    }

    /** 取得單張卡牌背景 */
    public getCardIconBG(index: number): cc.SpriteFrame {
        return this.cardIconBGs[index] || null;
    }

    /** 取得球背景 */
    public getBallBG(index: number): cc.SpriteFrame {
        const name = this.BallBGStr[index];
        return this.allAsset?.getSpriteFrame(name) || null;
    }

    /** 🎖 取得排行榜背景圖片 */
    public getLeaderboardBG(index: number): cc.SpriteFrame {
        const name = this.leaderboardBGStr[Math.min(index, 3)];
        return this.allAsset?.getSpriteFrame(name) || null;
    }

    /** 👤 取得預設排行榜玩家頭像 */
    public getUserIcon(index: number): cc.SpriteFrame {
        return this.getSafeSpriteFrame(this.userIcon, index);
    }

    /** 🥇 取得名次徽章（等級圖示） */
    public getDengjiIcon(index: number): cc.SpriteFrame {
        return this.getSafeSpriteFrame(this.dengji, index);
    }

    /** 取得 Peso 图标 - 绿色（赢钱/正常状态） */
    public getPesoGreenIcon(): cc.SpriteFrame {
        return this.allAsset?.getSpriteFrame('system-icon_peso_green') || null;
    }

    /** 取得 Peso 图标 - 灰色（输钱状态） */
    public getPesoGrayIcon(): cc.SpriteFrame {
        return this.allAsset?.getSpriteFrame('system-icon_peso_gray') || null;
    }

    /**
     * 根據名次索引安全地取得 SpriteFrame 陣列的圖片（限制最大 index 為 3）
     */
    private getSafeSpriteFrame(list: cc.SpriteFrame[], index: number): cc.SpriteFrame {
        const safeIndex = Math.min(index, 3);
        return list[safeIndex] || null;
    }
}

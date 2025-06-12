import { CommonTool } from "../../Tools/CommonTool";

const {ccclass, property} = cc._decorator;

/**
 * 游戏记录项组件
 * 功能：显示单条游戏记录，包括游戏类型、投注金额、输赢状态和时间
 */
@ccclass
export default class GameRecordItem extends cc.Component {

    @property({ type: cc.Label, visible: true })
    private Label_title: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_time: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_BetAmount: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_WinLost: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Node_E: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    private Node_BJ: cc.Node = null;

    /** 输赢状态颜色配置 */
    private readonly winLostColor: cc.Color[] = [
        new cc.Color(242, 5, 5),        // 输时候的颜色（红色）
        new cc.Color(29, 189, 106),     // 赢时候的颜色（绿色）
    ];
    private data : any;
    private index : number;

    /**
     * 设置游戏记录数据
     * @param data 游戏记录数据
     */
    public setData(data: any, index?: number) {
        this.data = data;
        this.index = index;

        // 设置游戏类型显示
        this.setGameTypeDisplay(data.play_name);
        
        // 设置投注金额 - 使用货币格式
        const formattedBetAmount = CommonTool.formatMoney2(parseFloat(data.amount) || 0);
        this.Label_BetAmount.string = formattedBetAmount;
        
        // 设置输赢金额和颜色
        this.setWinLostDisplay(data.win_lose);
        
        // 设置时间显示
        this.setTimeDisplay(data.created_at);

        this.node.off("click", this.OnClick, this); // 防止重複綁定
        this.node.on("click", this.OnClick, this);
    }

    OnClick() {
        this.node.emit("ItemEvent", this.index);
    }

    /**
     * 设置游戏类型显示
     * @param playName 游戏名称
     */
    private setGameTypeDisplay(playName: string) {
        switch (playName) {
            case 'BGM Extra Patterns':
                this.Node_E.active = true;
                this.Node_BJ.active = false;
                break;
            case 'BGM Bingo&Jackpot':
                this.Node_E.active = false;
                this.Node_BJ.active = true;
                break;
            default:
                this.Node_E.active = false;
                this.Node_BJ.active = false;

        }
    }

    /**
     * 设置输赢显示和颜色
     * @param winLose 输赢金额字符串 (如: "+53000.00" 或 "-53000.00")
     */
    private setWinLostDisplay(winLose: string) {
        // 提取数字部分和符号
        const isPositive = winLose.startsWith('+');
        const isNegative = winLose.startsWith('-');
        const numericValue = parseFloat(winLose.replace(/[+\-]/g, '')) || 0;
        
        // 根据正负号判断输赢状态并设置颜色和格式
        if (isPositive) {
            // 赢钱 - 绿色，显示 + 货币符号 + 金额
            this.Label_WinLost.node.color = this.winLostColor[1];
            this.Label_WinLost.string = CommonTool.formatMoney2(numericValue, "+");
        } else if (isNegative) {
            // 输钱 - 红色，显示 - 货币符号 + 金额
            this.Label_WinLost.node.color = this.winLostColor[0];
            this.Label_WinLost.string = CommonTool.formatMoney2(numericValue, "-");
        } else {
            // 和局 - 绿色，显示货币符号 + 金额
            this.Label_WinLost.node.color = this.winLostColor[1];
            this.Label_WinLost.string = CommonTool.formatMoney2(numericValue);
        }
    }

    /**
     * 设置时间显示
     * @param timestamp 时间戳 (如: 1748484008587)
     */
    private setTimeDisplay(timestamp: number) {
        const formattedTime = this.formatTimestamp(timestamp);
        this.Label_time.string = formattedTime;
    }

    /**
     * 将时间戳转换为指定格式
     * @param timestamp 时间戳
     * @returns 格式化的时间字符串 "MM-dd-yyyy HH:mm:ss"
     */
    private formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);
        
        // 获取各个时间组件
        const month = this.padZero(date.getMonth() + 1);    // 月份从0开始，需要+1
        const day = this.padZero(date.getDate());
        const year = date.getFullYear();
        const hours = this.padZero(date.getHours());
        const minutes = this.padZero(date.getMinutes());
        const seconds = this.padZero(date.getSeconds());
        
        // 返回格式: "03-08-2025 17:23:32"
        return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 数字补零（小于10的数字前面加0）
     * @param num 数字
     * @returns 补零后的字符串
     */
    private padZero(num: number): string {
        return num < 10 ? `0${num}` : num.toString();
    }
}

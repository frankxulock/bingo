import BallComponent from "../../../Common/Base/component/BallCompoent";
import { CARD_CONTENT, CARD_GAMEPLAY, CARD_STATUS } from "../../../Common/Base/CommonData";
import MegaManager from "../../../Common/Base/gameMega/MegaManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import BingoMegaUI from "../BingoMegaUI";
import { CardMega } from "../../../Common/Base/card/CardMega";
import VirtualScrollView from "../../../Common/Tools/Scroll/VirtualScrollView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class matchDetails extends cc.Component {
    @property({ type: cc.Node, visible: true })
    private Node_icon : cc.Node = null; 
    @property({ type: cc.Node, visible: true })
    private Node_info : cc.Node = null; 
    @property({ type: cc.Sprite, visible: true })
    private Sprite_icon : cc.Sprite = null; 
    @property({ type: cc.Label, visible: true })
    private Label_deltaIcon : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_currencyIcon : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_winLossAmount : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_totalCards : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_tableID : cc.Label = null; 
    @property({ type: cc.Label, visible: true })
    private Label_time : cc.Label = null; 
    @property({ type: cc.Node, visible: true })
    private Node_extraBalls : cc.Node = null; 
    @property({ type: cc.Node, visible: true })
    private Node_bingoBalls : cc.Node = null; 
    @property({ type: cc.Node, visible: true })
    private Group_Balls : cc.Node = null; 
    @property({ type: cc.Node, visible: true })
    private Group_Balls2 : cc.Node = null; 
    private balls : BallComponent[] = [];
    @property({ type: VirtualScrollView, visible: true })
    private ScrollView_card : VirtualScrollView = null; 

    private data;

    /** 設置詳情頁面 */
    public setPageState(data) {
        if(!data) {

            return;
        }
        
        this.data = data;
        
        // 设置基本信息
        this.setBasicInfo(data);
        
        // 设置开奖球号（即使为空也要调用，以正确设置节点状态）
        this.setLotteryBalls(data.lottery_content || "");
        
        // 设置卡片信息
        this.setCardInfo(data.bet_content);
        
        // 计算并设置 ScrollView_card 的高度
        this.calculateScrollViewHeight();
    }

    /**
     * 设置基本信息
     */
    private setBasicInfo(data: any) {
        // 设置游戏类型图标
        this.setGameTypeIcon(data.play_name);
        
        // 设置输赢金额和颜色
        this.setWinLossDisplay(data.win_lose, data.award_amount);
        
        // 设置卡片总数
        this.Label_totalCards.string = `${data.quantity}`;
        
        // 设置桌台ID
        this.Label_tableID.string = `${data.issue_number}`;
        
        // 设置时间
        this.setTimeDisplay(data.created_at);
    }

    /**
     * 设置游戏类型图标
     */
    private setGameTypeIcon(playName: string) {
        // 根据输赢状态设置图标
        const winLose = this.data.win_lose;
        let spriteFrame: cc.SpriteFrame = null;
        let iconType = 'green'; // 默认使用绿色
        
        // 判断输赢状态
        if (winLose && typeof winLose === 'string' && winLose.trim() !== '') {
            if (winLose.startsWith('-')) {
                // 输钱 - 使用灰色图标
                spriteFrame = BingoMegaUI.getInstance().getPesoGrayIcon();
                iconType = 'gray';
            } else {
                // 赢钱（+开头）或其他情况 - 使用绿色图标
                spriteFrame = BingoMegaUI.getInstance().getPesoGreenIcon();
                iconType = 'green';
            }
        } else {
            // 没输没赢（空字符串或null）- 使用绿色图标
            spriteFrame = BingoMegaUI.getInstance().getPesoGreenIcon();
            iconType = 'green';
        }
        
        // 设置图标
        if (this.Sprite_icon && spriteFrame) {
            this.Sprite_icon.spriteFrame = spriteFrame;
        } else {
            console.warn('无法设置图标: Sprite_icon或spriteFrame为空', {
                hasSprite: !!this.Sprite_icon,
                hasSpriteFrame: !!spriteFrame
            });
        }

    }

    /**
     * 设置输赢显示
     */
    private setWinLossDisplay(winLose: string, awardAmount: string) {
        // 设置输赢金额
        const isPositive = winLose.startsWith('+');
        const isNegative = winLose.startsWith('-');
        const numericValue = parseFloat(winLose.replace(/[+\-]/g, '')) || 0;
        let color = cc.Color.WHITE;
        
        if (isPositive) {
            color = new cc.Color(29, 189, 106); // 绿色
            this.Label_deltaIcon.string = '+';
        } else if (isNegative) {
            color = new cc.Color(242, 5, 5); // 红色
            this.Label_deltaIcon.string = '-';
        } else {
            color = new cc.Color(29, 189, 106); // 绿色
            this.Label_deltaIcon.string = '';
        }

        this.Label_deltaIcon.node.color = color;
        this.Label_currencyIcon.string = MegaManager.getInstance().getCurrency();
        this.Label_currencyIcon.node.color = color
        this.Label_winLossAmount.string = CommonTool.formatNumber(numericValue);
        this.Label_winLossAmount.node.color = color;
    }

    /**
     * 设置时间显示
     */
    private setTimeDisplay(timestamp: number) {
        const date = new Date(timestamp);
        
        // 格式化日期为 MM-dd-yyyy 格式
        const month = this.padZero(date.getMonth() + 1);
        const day = this.padZero(date.getDate());
        const year = date.getFullYear();
        const formattedDate = `${month}-${day}-${year}`;
        
        // 格式化时间为 HH:mm:ss 格式
        const hours = this.padZero(date.getHours());
        const minutes = this.padZero(date.getMinutes());
        const seconds = this.padZero(date.getSeconds());
        const formattedTime = `${hours}:${minutes}:${seconds}`;
        
        this.Label_time.string = `${formattedDate} ${formattedTime}`;
    }

    /**
     * 数字补零（小于10的数字前面加0）
     * @param num 数字
     * @returns 补零后的字符串
     */
    private padZero(num: number): string {
        return num < 10 ? `0${num}` : num.toString();
    }

    /**
     * 设置开奖球号
     */
    private setLotteryBalls(lotteryContent: string) {
        // 如果有开奖内容且不为空字符串
        if (lotteryContent && lotteryContent.trim() !== "") {
            const ballNumbers = lotteryContent.split(',')
                .map(num => parseInt(num.trim()))
                .filter(num => !isNaN(num)); // 过滤掉无效数字
            
            // 初始化球号组件
            this.initializeBalls();
            
            // 设置球号显示
            ballNumbers.forEach((number, index) => {
                if (index < this.balls.length) {
                    this.balls[index].setBallNumber(number);
                    this.balls[index].node.active = true;
                }
            });
    
            // 根据球号数量决定显示哪些区域
            if(ballNumbers.length <= 44) {
                this.Node_extraBalls.active = true;
                this.Node_bingoBalls.active = false;
            } else {
                this.Node_extraBalls.active = true;
                this.Node_bingoBalls.active = true;
            }
            
            // 隐藏多余的球号
            for (let i = ballNumbers.length; i < this.balls.length; i++) {
                this.balls[i].node.active = false;
            }
        } else {
            // 没有开奖内容时，隐藏所有球号区域
            this.Node_extraBalls.active = false;
            this.Node_bingoBalls.active = false;
            
            // 隐藏所有球号
            this.initializeBalls();
            this.balls.forEach(ball => {
                ball.node.active = false;
            });
        } 
    }

    /**
     * 初始化球号组件
     */
    private initializeBalls() {
        if (this.balls.length === 0) {
            // 从两个球号组获取所有球号组件
            const balls1 = this.Group_Balls.getComponentsInChildren(BallComponent);
            const balls2 = this.Group_Balls2.getComponentsInChildren(BallComponent);
            this.balls = [...balls1, ...balls2];
        }
    }

    /**
     * 设置卡片信息 - 转化为 CardMega 格式
     */
    private setCardInfo(betContent: any[]) {
        if (!betContent || betContent.length === 0) {
            this.ScrollView_card.node.active = false;
            return;
        }
        
        // 获取开奖球号
        const lotteryNumbers = this.getLotteryNumbers();
        
        // 将每个卡片转化为 CardMega 格式
        const cardMegaList = betContent.map((card, index) => {
            return this.createCardMegaFromBetContent(card, lotteryNumbers, index);
        });
        
        // 刷新 ScrollView 数据
        this.ScrollView_card.node.active = true;
        this.ScrollView_card.refreshData(cardMegaList);
    }

    /**
     * 获取开奖球号数组
     */
    private getLotteryNumbers(): number[] {
        if (!this.data.lottery_content) return [];
        return this.data.lottery_content.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    }

    /**
     * 从 bet_content 创建 CardMega 对象
     */
    private createCardMegaFromBetContent(betCard: any, lotteryNumbers: number[], cardIndex: number): CardMega {
        // 解析卡片号码
        const cardNumbers = CommonTool.TransformCardInfo(betCard.numbers);
        
        // 确定玩法类型
        const playState = this.getPlayStateFromPlayName(this.data.play_name);
        
        // 检查是否有 DIY 或 Free
        const originalNumbers = betCard.numbers;
        const hasDIY = originalNumbers.includes('DIY');
        const hasFree = originalNumbers.includes('Free');
        
        // 确定卡片内容类型
        let cardContent = CARD_CONTENT.NORMAL;
        if (hasDIY) {
            cardContent = CARD_CONTENT.DIY;
        } else if (hasFree) {
            // Free 通常表示中心免费格子，属于正常卡片
            cardContent = CARD_CONTENT.NORMAL;
        }
        
        // 创建 CardMega 对象的数据
        const cardData = {
            cardId: cardIndex,
            cardState: CARD_STATUS.NORMAL, // 历史记录都是正常卡片
            cardContent: cardContent,
            playState: playState,
            numbers: cardNumbers
        };
        
        // 创建 CardMega 实例（只传入一个参数）
        const cardMega = new CardMega(cardData);
        
        // 模拟开奖过程，更新中奖状态
        this.simulateDrawing(cardMega, lotteryNumbers);
        
        // 手动设置中奖金额（直接访问 protected 属性）
        cardMega['totalWin'] = parseFloat(betCard.prizes_amount) || 0;
        
        // 添加奖项信息到卡片对象（用于显示）
        cardMega['prizesInfo'] = {
            prizes_name: betCard.prizes_name,
            prizes_amount: betCard.prizes_amount,
            prizes_type: betCard.prizes_type
        };
        
        // 添加原始号码信息用于调试
        cardMega['originalNumbers'] = originalNumbers;

        return cardMega;
    }

    /**
     * 根据 play_name 获取玩法类型
     */
    private getPlayStateFromPlayName(playName: string): CARD_GAMEPLAY {
        switch (playName) {
            case 'BGM Extra Patterns':
                return CARD_GAMEPLAY.EXTRA;
            case 'BGM Bingo&Jackpot':
                return CARD_GAMEPLAY.JACKPOT;
            default:

                return CARD_GAMEPLAY.EXTRA;
        }
    }

    /**
     * 模拟开奖过程，更新卡片中奖状态
     */
    private simulateDrawing(cardMega: CardMega, lotteryNumbers: number[]) {
        // 按顺序模拟每个开奖球号
        lotteryNumbers.forEach(ballNumber => {
            cardMega.updateCard(ballNumber);
        });
    }

    /**
     * 计算 ScrollView_card 的高度
     */
    private calculateScrollViewHeight() {
        // 计算需要减去的高度，只计算激活状态的节点
        let usedHeight = 10; // 顶部间距
        let activeComponents = 0; // 激活的组件数量
        
        // 检查并累加激活节点的高度
        if (this.Node_icon && this.Node_icon.active) {
            usedHeight += this.Node_icon.height;
            activeComponents++;
        }
        
        if (this.Node_info && this.Node_info.active) {
            usedHeight += this.Node_info.height;
            activeComponents++;
        }
        
        if (this.Node_extraBalls && this.Node_extraBalls.active) {
            usedHeight += this.Node_extraBalls.height;
            activeComponents++;
        }
        
        if (this.Node_bingoBalls && this.Node_bingoBalls.active) {
            usedHeight += this.Node_bingoBalls.height;
            activeComponents++;
        }
        
        // 计算组件间距：激活组件数量-1个间距，每个间距9px
        const spacingHeight = Math.max(0, activeComponents - 1) * 9;
        usedHeight += spacingHeight;
        
        // 底部预留间距
        usedHeight += 9;
        
        // 计算 ScrollView_card 的高度
        let height = this.node.height - usedHeight;
        
        // 确保高度不为负数
        height = Math.max(height, 50);

        // 设置 ScrollView_card 的高度
        this.ScrollView_card.node.height = height;
        this.ScrollView_card.content.parent.height = height;
        this.ScrollView_card.scrollToTop();
    }
}
import { CommonTool } from "../../../../Common/Tools/CommonTool";
import { CardMega } from "../../../../Common/Base/card/CardMega";
import CardIcon from "./CardIcon";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameRecordCard extends cc.Component {

    // Bingo Jackpot 显示节点
    @property({ type: cc.Node, visible: true })
    private Node_BingoJackpot: cc.Node = null;

    // 额外奖励显示节点
    @property({ type: cc.Node, visible: true })
    private Node_E: cc.Node = null;

    // 数字背景图片组
    @property({ type: cc.Node, visible: true })
    private Node_NumberGroup: cc.Node = null;

    // 数字文字组
    @property({ type: cc.Node, visible: true })
    private Node_NumberTxtGroup: cc.Node = null;

    // 中奖线显示节点群组
    @property({ type: cc.Node, visible: true })
    private Node_WinLineGroup: cc.Node = null;

    // 中奖信息显示容器
    @property({ type: cc.Node, visible: true })
    private Node_WinGroup: cc.Node = null;

    // 中奖金额 Label
    @property({ type: cc.Label, visible: true })
    private Label_WinAmount: cc.Label = null;
    
    // 卡片上的数字项目（CardIcon 组件）
    private cardItems: CardIcon[] = [];
    private cardTxt: cc.RichText[] = [];
    
    // 文字颜色配置
    private cardText: string[] = [
        "#1d1d1d", // 未中奖 - 黑色
        "#ffffff", // 中奖 - 白色
        "#fe582a", // 特殊状态 - 橙色
    ];

    private cardMega: CardMega = null;

    /**
     * 设置卡片数据
     * @param cardMega CardMega 对象
     */
    public setData(cardMega: CardMega) {
        this.cardMega = cardMega;
        
        // 初始化组件
        this.initializeComponents();
        
        // 设置卡片显示
        this.updateCardDisplay();
    }

    /**
     * 初始化组件
     */
    private initializeComponents() {
        // 初始化 cardItems（一次性抓取 CardIcon 组件）
        if (this.cardItems.length === 0) {
            this.cardItems = this.Node_NumberGroup.getComponentsInChildren(CardIcon);
        }
        
        // 初始化文字组件
        if (this.cardTxt.length === 0) {
            this.cardTxt = this.Node_NumberTxtGroup.getComponentsInChildren(cc.RichText);
        }
    }

    /**
     * 更新卡片显示
     */
    private updateCardDisplay() {
        // 获取卡片显示数据
        const viewData = this.cardMega.getCardViewData();

        // 设置游戏类型显示
        if (this.Node_BingoJackpot) {
            this.Node_BingoJackpot.active = viewData.haveBingoJackpo;
        }
        if (this.Node_E) {
            this.Node_E.active = viewData.haveExtra;
        }

        // 设置数字显示
        this.updateNumberDisplay(viewData);

        // 设置中奖线显示
        this.updateWinLines(viewData);

        // 设置中奖信息显示
        this.updateWinInfo(viewData);
    }

    /**
     * 更新数字显示
     */
    private updateNumberDisplay(viewData: any) {
        const numbers = viewData.numbers;
        const numberItemBGs = viewData.numberItemBGs;

        this.cardItems.forEach((item, index) => {
            if (index < numbers.length) {
                const number = numbers[index];
                const bgType = numberItemBGs[index];
                
                // 设置背景图片
                item.setSprite(bgType);

                // 设置数字文字
                if (index < this.cardTxt.length) {
                    let displayText: string;
                    if (number !== null) {
                        displayText = number.toString();
                    } else {
                        // 根据卡片类型决定显示 DIY 还是 Free
                        displayText = viewData.DIYCard ? "DIY" : "Free";
                    }
                    this.setLabel(this.cardTxt[index], displayText, bgType);
                }
            }
        });
    }

    /**
     * 更新中奖线显示
     */
    private updateWinLines(viewData: any) {
        if (this.Node_WinLineGroup && viewData.rewardLine) {
            this.Node_WinLineGroup.children.forEach((line, index) => {
                line.active = viewData.rewardLine.includes(index);
            });
        }
    }

    /**
     * 更新中奖信息显示
     */
    private updateWinInfo(viewData: any) {
        if (this.Node_WinGroup) {
            const hasWin = viewData.totalWin && viewData.totalWin > 0;

            if (hasWin) {
                // 设置中奖金额
                if (this.Label_WinAmount) {
                    const formattedAmount = CommonTool.formatMoney2(viewData.totalWin, "");
                    this.Label_WinAmount.string = formattedAmount;
                }
            }else {
                this.Label_WinAmount.string = "0";
            }
        }
    }

    /**
     * 设置显示的文字内容
     * @param text 要设置的 RichText 组件
     * @param txt 文字内容
     * @param colorType 颜色类型索引
     */
    private setLabel(text: cc.RichText, txt: string, colorType: number) {
        const color = `<color=${this.cardText[colorType]}>${txt}</color>`;
        text.string = color;
    }
}

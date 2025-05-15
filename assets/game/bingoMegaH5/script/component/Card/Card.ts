import { CommonTool } from "../../../../common/Tools/CommonTool";
import CardIcon from "./CardIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {
    // 卡片標題 Label
    @property({ type: cc.Label, visible: true })
    private Label_titel: cc.Label = null;

    // Bingo Jackpot 顯示節點
    @property({ type: cc.Node, visible: true })
    private Node_BingoJackpot: cc.Node = null;

    // 額外獎勵顯示節點
    @property({ type: cc.Node, visible: true })
    private Node_E: cc.Node = null;

    // 數字項目群組容器
    @property({ type: cc.Node, visible: true })
    private Node_NumberGroup: cc.Node = null;

    // 卡片上的數字項目（CardIcon 組件）
    private cardItems: CardIcon[] = [];

    // 中獎線顯示節點群組
    @property({ type: cc.Node, visible: true })
    private Node_WinLineGroup: cc.Node = null;

    // 中獎資訊顯示容器
    @property({ type: cc.Node, visible: true })
    private Node_WinGroup: cc.Node = null;

    // 中獎金額 Label
    @property({ type: cc.Label, visible: true })
    private Label_WinAmount: cc.Label = null;

    /**
     * 設定卡片資料與畫面顯示
     * @param cardData - 傳入的卡片資料
     * @param index - 可選的索引（目前未使用）
     */
    setData(cardData: any, index?: number) {
        // 取得要顯示的卡片資訊
        let data = cardData.getCardViewData();

        // 設定卡片標題
        CommonTool.setLabel(this.Label_titel, data.title);

        // 設定 Bingo Jackpot 與額外獎勵的顯示
        this.Node_BingoJackpot.active = data.haveBingoJackpo;
        this.Node_E.active = data.haveExtra;

        // 初始化 cardItems（一次性抓取 CardIcon 組件）
        if (this.cardItems == null) {
            this.cardItems = this.Node_NumberGroup.getComponentsInChildren(CardIcon);
        }

        // 設定每個數字格的背景與數字/文字內容
        this.cardItems.forEach((item, index) => {
            let numberItemBG = data.numberItemBGs[index];
            let numbers = data.numbers[index];

            item.setSprite(numberItemBG);

            if (numbers != null)
                item.setLabel(numbers);
            else
                item.setLabel((data.DIYCard) ? "DIY" : "Free");
        });

        // 顯示中獎線（如果有）
        if (this.Node_WinLineGroup && data.rewardLine) {
            this.Node_WinLineGroup.children.forEach((item, index) => {
                item.active = data.rewardLine.includes(index);
            });
        }

        // 顯示總中獎金額（如果有）
        if (this.Node_WinGroup) {
            const hasWin = data.totalWin && data.totalWin > 0;
            this.Node_WinGroup.active = hasWin;

            if (hasWin) {
                CommonTool.setLabel(this.Label_WinAmount, CommonTool.formatMoney2(data.totalWin));
            }
        }
    }
}

import { CARD_STATUS } from "../../../../Common/Base/CommonData";
import { CommonTool } from "../../../../Common/Tools/CommonTool";
import BingoMegaUI from "../../BingoMegaUI";
import CardIcon from "./CardIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {
    // 卡片標題
    @property({ type: cc.Sprite, visible: true })
    private Node_titel: cc.Sprite = null;

    // Bingo Jackpot 顯示節點
    @property({ type: cc.Node, visible: true })
    private Node_BingoJackpot: cc.Node = null;

    // 額外獎勵顯示節點
    @property({ type: cc.Node, visible: true })
    private Node_E: cc.Node = null;

    // 圖片
    @property({ type: cc.Node, visible: true })
    private Node_NumberGroup: cc.Node = null;

    // 數字
    @property({ type: cc.Node, visible: true })
    private Node_NumberTxtGroup: cc.Node = null;

    // 卡片上的數字項目（CardIcon 組件）
    private cardItems: CardIcon[] = [];

    private cardTxt: cc.Label[] = [];
    private cardText: cc.Color[] = [
        new cc.Color(29, 29, 29),
        new cc.Color(255, 255, 255),
        new cc.Color(254, 88, 42)
    ];

    // 中獎線顯示節點群組
    @property({ type: cc.Node, visible: true })
    private Node_WinLineGroup: cc.Node = null;

    // 中獎金額 Label
    @property({ type: cc.Label, visible: true })
    private Label_WinAmount: cc.Label = null;

    public data;

    /**
     * 設定卡片資料與畫面顯示
     * @param cardData - 傳入的卡片資料
     * @param index - 可選的索引（目前未使用）
     */
    setData(cardData: any) {
        // 取得要顯示的卡片資訊
        let data = cardData.getCardViewData();
        this.data = cardData;
        // 設定卡片標題
        this.Node_titel.node.active = (data.cardState == CARD_STATUS.PREORDER) ? true : false;
        this.Node_titel.spriteFrame = BingoMegaUI.getInstance().getCardTitle(data.title);

        // 設定 Bingo Jackpot 與額外獎勵的顯示
        this.Node_BingoJackpot.active = data.haveBingoJackpo;
        this.Node_E.active = data.haveExtra;

        // 初始化 cardItems（一次性抓取 CardIcon 組件）
        if (this.cardItems.length == 0) {
            this.cardItems = this.Node_NumberGroup.getComponentsInChildren(CardIcon);
        }
        if(this.cardTxt.length == 0) {
            this.cardTxt = this.Node_NumberTxtGroup.getComponentsInChildren(cc.Label);
        }

        // 設定每個數字格的背景與數字/文字內容
        this.cardItems.forEach((item, index) => {
            let numberItemBG = data.numberItemBGs[index];
            let numbers = data.numbers[index];

            item.setSprite(numberItemBG);

            if (numbers != null)
                this.setLabel(this.cardTxt[index], numbers, numberItemBG);
            else
                this.setLabel(this.cardTxt[index], ((data.DIYCard) ? "DIY " : "Free"), numberItemBG);
        });

        // 顯示中獎線（如果有）
        if (this.Node_WinLineGroup && data.rewardLine) {
            this.Node_WinLineGroup.children.forEach((item, index) => {
                item.active = data.rewardLine.includes(index);
            });
        }

        // 顯示總中獎金額（如果有）
        if (this.Label_WinAmount) {
            const hasWin = data.totalWin && data.totalWin > 0;
            this.Label_WinAmount.node.active = hasWin;
            if (hasWin) {
                CommonTool.setLabel(this.Label_WinAmount, "WIN:" + CommonTool.formatMoney2(data.totalWin, ""));
            }
        }
    }

    /**
     * 設定顯示的文字內容
     * @param txt 要設定的文字內容
     */
    public setLabel(text : cc.Label , txt: string, numberItem : number) {
        text.node.color = this.cardText[numberItem];
        CommonTool.setLabel(text, txt);
        // this.alignLabelToPixel(text);
    }

    // protected update(dt: number): void {
    //     this.cardTxt.forEach((txt)=>{
    //         this.alignLabelToPixel(txt);
    //         console.log("強制轉化座標位置");
    //     })
    // }

    alignLabelToPixel(label: cc.Label) {
        // 1. 取得目前的世界座標
        let worldPos = label.node.convertToWorldSpaceAR(cc.Vec2.ZERO);

        // 2. 對齊像素（整數）
        worldPos.x = Math.round(worldPos.x);
        worldPos.y = Math.round(worldPos.y);

        // 3. 反轉回本地座標
        const parent = label.node.parent;
        if (!parent) return;

        let localPos = parent.convertToNodeSpaceAR(worldPos);

        // 4. 設定 label 的位置（在父節點內）
        label.node.setPosition(localPos);
        console.warn(localPos);
        // 5. 強制 scale = 1（避免像素縮放錯誤）
        label.node.setScale(1);
    }
}

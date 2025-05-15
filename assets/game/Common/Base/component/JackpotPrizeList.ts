import MegaDataManager from "../../../common/Base/gameMega/MegaDataManager";
import { CommonTool } from "../../../common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotPrizeList extends cc.Component {

    /** 各獎項顯示用的 Label 元件 */
    @property({ type: cc.Label, visible: true })
    private Label_JP_Amount: cc.Label = null;    // Jackpot 獎金標籤
    @property({ type: cc.Label, visible: true })
    private Label_EP_Amount: cc.Label = null;    // Bingo 獎金標籤
    @property({ type: cc.Label, visible: true })
    private Label_1TG_Amount: cc.Label = null;   // 1TG 獎金標籤
    @property({ type: cc.Label, visible: true })
    private Label_2TG_Amount: cc.Label = null;   // 2TG 獎金標籤

    /**
     * 初始化時呼叫，從 MegaDataManager 取得最新獎金數據，
     * 並更新至對應的 Label 上顯示
     */
    protected start(): void {
        // 從 MegaDataManager 取得獎金和 Bingo 獲勝資料
        const data = MegaDataManager.getInstance().getJackpotAndBingoWinData();

        // 利用共用工具函式設定 Label 文字，確保格式統一
        CommonTool.setLabel(this.Label_JP_Amount, data.Jackpot);
        CommonTool.setLabel(this.Label_EP_Amount, data.Bingo);
        CommonTool.setLabel(this.Label_1TG_Amount, data.OneTG);
        CommonTool.setLabel(this.Label_2TG_Amount, data.TWOTG);
    }
}

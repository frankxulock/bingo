import BingoMegaUI from "../../../bingoMegaH5/script/BingoMegaUI";
import AvatarComponent from "../../../Common/Base/component/AvatarComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

/**
 * JP : Bingo&Jackpot 歷史紀錄
 * EP : Extral 歷史紀錄
 */
@ccclass
export default class HistoryItem extends cc.Component {

    /** 玩家頭像組件 */
    @property({ type: AvatarComponent, visible: true })
    private Node_Avatar: AvatarComponent = null;

    /** 玩家名稱標籤 */
    @property({ type: cc.Label, visible: true })
    private Label_name: cc.Label = null;

    /** JP 金額標籤（有日期時顯示） */
    @property({ type: cc.Label, visible: true })
    private Label_JP_Amount: cc.Label = null;

    /** JP 日期標籤（有日期時顯示） */
    @property({ type: cc.Label, visible: true })
    private Label_JP_Date: cc.Label = null;

    /** EP 金額標籤（無日期時顯示） */
    @property({ type: cc.Label, visible: true })
    private Label_EP_Amount: cc.Label = null;

    /** JP 金額旁的圖示節點（有日期時顯示） */
    @property({ type: cc.Node, visible: true })
    private Node_Jicon: cc.Node = null;

    /**
     * 設定歷史紀錄資料與顯示
     * @param data 歷史紀錄資料物件，至少含 name, amount, date 欄位
     * @param index 該條目在列表的索引（用於設定背景圖）
     */
    setData(data: any, index: number) {
        if (!data) return;

        // 取得 BingoMegaUI 單例，方便取得背景圖資源
        const ui = BingoMegaUI.getInstance();

        // 1. 設定背景板圖片（依據條目索引決定不同背景）
        const bgSprite = ui.getLeaderboardBG(index);
        CommonTool.setSprite(this.node, bgSprite);

        // 2. 設定玩家名稱
        CommonTool.setLabel(this.Label_name, data.name);

        // 3. 判斷是否有日期，決定 JP 或 EP 金額的顯示與對應圖示顯示狀態
        const hasDate = !!data.date;
        this.Label_JP_Amount.node.active = hasDate;  // 有日期顯示 JP 金額
        this.Node_Jicon.active = hasDate;            // JP 圖示顯示
        this.Label_EP_Amount.node.active = !hasDate; // 無日期顯示 EP 金額

        // 4. 設定金額文字，兩者格式化相同
        const formattedAmount = CommonTool.formatMoney2(data.amount, "");
        if (hasDate) {
            CommonTool.setLabel(this.Label_JP_Amount, formattedAmount);
        } else {
            CommonTool.setLabel(this.Label_EP_Amount, formattedAmount);
        }

        // 5. 設定日期文字（只有 JP 有日期）
        CommonTool.setLabel(this.Label_JP_Date, hasDate ? data.date : "");
    }
}

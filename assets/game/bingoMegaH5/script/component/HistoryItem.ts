import AvatarComponent from "../../../Common/Base/component/AvatarComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import BingoMegaUI from "../BingoMegaUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HistoryItem extends cc.Component {

    @property({ type: AvatarComponent, visible: true })
    private Node_Avatar: AvatarComponent = null;
    @property({ type: cc.Label, visible: true })
    private Label_name: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_JP_Amount: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_JP_Date: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_EP_Amount: cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Node_Jicon: cc.Node = null;

    private data : any;
    setData(data: any, index : number) {
        if (!data) return;
    
        this.data = data;

        // 👉 取得當前節點在父節點中的索引
        // const index = this.node.getSiblingIndex();
        const ui = BingoMegaUI.getInstance();
        console.log(index);
        // 🟩 設定背景板圖片
        const bgSprite = ui.getLeaderboardBG(index);
        CommonTool.setSprite(this.node, bgSprite);
    
        // 🧾 設定名稱
        CommonTool.setLabel(this.Label_name, data.name);
    
        // 💰 設定 JP/EP 金額與顯示邏輯
        const hasDate = !!data.date;
        this.Label_JP_Amount.node.active = hasDate;
        this.Node_Jicon.active = hasDate;
        this.Label_EP_Amount.node.active = !hasDate;
    
        CommonTool.setLabel(this.Label_JP_Amount, CommonTool.formatMoney2(data.amount, ""));
        CommonTool.setLabel(this.Label_EP_Amount, CommonTool.formatMoney2(data.amount, ""));
    
        // 📅 設定日期（只有 JP 顯示）
        CommonTool.setLabel(this.Label_JP_Date, hasDate ? data.date : "");
    }
}

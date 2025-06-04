import { CommonTool } from "../../../Common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NalyzeDataItem extends cc.Component {

    // 顯示號碼的 Label 節點
    @property(cc.Label)
    private Label_number: cc.Label = null;

    // 滑塊顯示顏色與高度的 Node 節點
    @property(cc.Node)
    private Node_Slider: cc.Node = null;

    // 顏色設定 (使用固定顏色常數，方便後續調整)
    private readonly PopularColor: cc.Color = new cc.Color(251, 84, 38);    // #FB5426
    private readonly ObscureColor: cc.Color = new cc.Color(59, 134, 239);   // #3B86EF
    private readonly NormalColor: cc.Color = new cc.Color(236, 236, 236);   // #ECECEC

    /**
     * 設定資料並更新顯示狀態
     * @param data - 傳入的資料物件，須包含 ballNumber, color, ratio 屬性
     * @param index - (選填)資料的索引位置
     */
    public setData(data: { ballNumber: string | number, color: string, ratio: number }, index?: number): void {
        // 設定號碼顯示文字
        CommonTool.setLabel(this.Label_number, data.ballNumber);

        // 根據資料 color 屬性設定滑塊顏色
        switch (data.color.toLowerCase()) {
            case "red":
                this.Node_Slider.color = this.PopularColor;
                break;
            case "blue":
                this.Node_Slider.color = this.ObscureColor;
                break;
            default:
                this.Node_Slider.color = this.NormalColor;
                break;
        }

        // 計算目標高度，基準高度 106 乘上比率 (ratio)
        const baseHeight = 106;
        const targetHeight = baseHeight * data.ratio;

        // 停止目前此節點所有正在執行的動畫，避免動畫衝突
        cc.Tween.stopAllByTarget(this.Node_Slider);

        // 使用 Tween 平滑變更節點高度達到動畫效果，0.3 秒時間，緩動曲線為 sineOut
        cc.tween(this.Node_Slider)
            .to(0.3, { height: targetHeight }, { easing: 'sineOut' })
            .start();
    }
}

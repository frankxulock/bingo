import { CommonTool } from "../../../Common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AnalyzeDataItem extends cc.Component {

    @property({ type: cc.Label, visible: true })
    private Label_number: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    private Node_Slider: cc.Node = null;

    // 顏色設定
    private PoularColor: cc.Color = new cc.Color(251, 84, 38);    // #FB5426
    private ObscureColor: cc.Color = new cc.Color(59, 134, 239);  // #3B86EF
    private NormalColor: cc.Color = new cc.Color(236, 236, 236);  // #ECECEC

    setData(data: any, index?: number): void {

        // 設定號碼
        CommonTool.setLabel(this.Label_number, data.ballNumber);

        // 設定顏色
        switch (data.color) {
            case "red":
                this.Node_Slider.color = this.PoularColor;
                break;
            case "blue":
                this.Node_Slider.color = this.ObscureColor;
                break;
            default:
                this.Node_Slider.color = this.NormalColor;
                break;
        }

        // 計算目標高度
        const targetHeight = 106 * data.ratio;

        // 動畫改變 height（先停止前一個動畫）
        cc.Tween.stopAllByTarget(this.Node_Slider);

        cc.tween(this.Node_Slider)
            .to(0.3, { height: targetHeight }, { easing: 'sineOut' })
            .start();
    }
}
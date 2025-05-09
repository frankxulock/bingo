import { CommonTool } from "../../../Common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NumberToggle extends cc.Component {
    @property({ type: cc.Toggle, visible: true })
    private numberToggle: cc.Toggle = null;

    @property({ type: cc.Node, visible: true })
    private Sprite_bg: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    private Label_num: cc.Label = null;

    // 顏色設定
    private unselectedColor: cc.Color = new cc.Color(29, 29, 29); //#1d1d1d
    private selectedColor: cc.Color = new cc.Color(255, 255, 255); // #FFFFFF

    private data: {
        id: number;
        num: number;
        isSelected: boolean;
        isPurchased: boolean;
        [key: string]: any;
    } = null;

    public setData(data, index?: number): void {
        this.data = data;

        this.numberToggle.isChecked = data.isSelected;
        this.Sprite_bg.active = data.isSelected;
        this.Label_num.node.color = data.isSelected ? this.selectedColor : this.unselectedColor;
        CommonTool.setLabel(this.Label_num, data.num);

        this.numberToggle.node.off("toggle", this.onToggleChanged, this);
        this.numberToggle.node.on("toggle", this.onToggleChanged, this);
    }

    /** 設定顏色：可由外部設定為冷號、熱號等顏色 */
    public setColors(selected: cc.Color, unselected: cc.Color): void {
        this.selectedColor = selected;
        this.unselectedColor = unselected;

        // 更新當前顏色
        if (this.Label_num) {
            this.Label_num.node.color = this.data?.isSelected ? this.selectedColor : this.unselectedColor;
        }
    }

    public setChecked(isChecked: boolean): void {
        this.numberToggle.isChecked = isChecked;
        this.Sprite_bg.active = isChecked;
        this.Label_num.node.color = isChecked ? this.selectedColor : this.unselectedColor;

        if (this.data) {
            this.data.isSelected = isChecked;
        }
    }

    private onToggleChanged(toggle: cc.Toggle): void {
        if (this.data?.isPurchased) {
            toggle.isChecked = false;
            return;
        }

        this.setChecked(toggle.isChecked);

        this.node.emit("ItemEvent", {
            id: this.data.id,
            isChecked: toggle.isChecked,
        });
    }

    public getData(): any {
        return this.data;
    }
}

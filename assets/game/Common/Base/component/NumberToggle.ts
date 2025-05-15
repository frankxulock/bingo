import { CommonTool } from "../../../common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

/**
 * NumberToggle 是一個可切換選擇的數字按鈕組件，
 * 支援顯示不同顏色，並透過 toggle 事件通知外部選擇狀態改變。
 */
@ccclass
export default class NumberToggle extends cc.Component {
    @property({ type: cc.Toggle, visible: true })
    private toggle: cc.Toggle = null; // 主要 Toggle 組件

    @property({ type: cc.Node, visible: true })
    private backgroundNode: cc.Node = null; // 背景節點，用於顯示選中狀態

    @property({ type: cc.Label, visible: true })
    private numberLabel: cc.Label = null; // 顯示數字的 Label

    // 預設的顏色：未選中為深色，選中為白色
    private unselectedColor: cc.Color = new cc.Color(29, 29, 29); // #1d1d1d
    private selectedColor: cc.Color = new cc.Color(255, 255, 255); // #FFFFFF

    // 當前綁定的資料
    private data: {
        id: number;
        num: number;
        isSelected: boolean;
        isPurchased: boolean;
        [key: string]: any;
    } = null;

    /**
     * 初始化並綁定資料
     * @param data 物件包含 id, num, isSelected, isPurchased 等欄位
     * @param index （選填）項目索引
     */
    public setData(data: any, index?: number): void {
        // 初始化 toggle 狀態與 UI 表現
        this.toggle.isChecked = data.isSelected;
        this.backgroundNode.active = data.isSelected;
        this.numberLabel.node.color = data.isSelected ? this.selectedColor : this.unselectedColor;

        // 設定 Label 文字
        CommonTool.setLabel(this.numberLabel, data.num);

        // 移除舊的事件綁定，避免多次觸發
        this.toggle.node.off("toggle", this.onToggleChanged, this);
        // 監聽 toggle 狀態變更事件
        this.toggle.node.on("toggle", this.onToggleChanged, this);
    }

    /**
     * 外部可設定選中與未選中顏色（例如：熱號、冷號）
     * @param selected 選中狀態的顏色
     * @param unselected 未選中狀態的顏色
     */
    public setColors(selected: cc.Color, unselected: cc.Color): void {
        this.selectedColor = selected;
        this.unselectedColor = unselected;

        // 立即更新顏色，避免顯示異常
        if (this.numberLabel && this.data) {
            this.numberLabel.node.color = this.data.isSelected ? this.selectedColor : this.unselectedColor;
        }
    }

    /**
     * 設定 toggle 是否被選中，並更新 UI 狀態
     * @param isChecked 是否被選中
     */
    public setChecked(isChecked: boolean): void {
        this.toggle.isChecked = isChecked;
        this.backgroundNode.active = isChecked;
        this.numberLabel.node.color = isChecked ? this.selectedColor : this.unselectedColor;

        if (this.data) {
            this.data.isSelected = isChecked;
        }
    }

    /**
     * Toggle 狀態改變事件處理器
     * @param toggle 當前觸發事件的 Toggle
     */
    private onToggleChanged(toggle: cc.Toggle): void {
        // 如果已購買，禁止切換，強制還原
        if (this.data?.isPurchased) {
            toggle.isChecked = false;
            return;
        }

        // 更新選中狀態 UI 與資料
        this.setChecked(toggle.isChecked);

        // 發送自定義事件給父節點或外部監聽，攜帶 id 與選中狀態
        this.node.emit("ItemEvent", {
            id: this.data.id,
            isChecked: toggle.isChecked,
        });
    }

    /**
     * 取得目前綁定的資料物件
     */
    public getData(): any {
        return this.data;
    }
}

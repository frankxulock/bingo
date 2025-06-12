const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomToggle extends cc.Component {
    @property(cc.Node)
    selected: cc.Node = null;

    @property(cc.Node)
    unselected: cc.Node = null;

    private _isChecked: boolean = false;

    @property({ tooltip: "是否選中" })
    get isChecked(): boolean {
        return this._isChecked;
    }

    set isChecked(value: boolean) {
        this._isChecked = value;
        this.updateVisualState();
    }

    onLoad() {
        this.updateVisualState();
        this.node.on(cc.Node.EventType.TOUCH_END, this.onToggle, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onToggle, this);
    }

    private onToggle() {
        this.isChecked = !this.isChecked;
        // 派發 toggle 事件，帶上 isChecked 狀態
        this.node.emit("toggle", this);
    }

    private updateVisualState() {
        if (this.selected) this.selected.active = this._isChecked;
        if (this.unselected) this.unselected.active = !this._isChecked;
    }
}

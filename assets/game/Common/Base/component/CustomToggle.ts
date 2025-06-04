/**
 * CustomToggle 組合組件
 * 使用組合模式包含一個 cc.Toggle，添加擴展功能
 * 優點：保持 Toggle 原生功能完整性，同時添加自定義行為
 */
@cc._decorator.ccclass
export default class CustomToggle extends cc.Component {

    /** 內部 Toggle 組件 */
    @cc._decorator.property(cc.Toggle)
    toggle: cc.Toggle = null;

    /** 未選中時顯示的節點（選中時會隱藏） */
    @cc._decorator.property(cc.Node)
    unselected: cc.Node = null;

    protected onLoad(): void {
        const toggle = this.node.getComponent(cc.Toggle);
        toggle.node.on('toggle', this.onToggleChanged, this);
    }

    onToggleChanged(toggle: cc.Toggle) {
        this.unselected.active = !toggle.isChecked;
    }
}

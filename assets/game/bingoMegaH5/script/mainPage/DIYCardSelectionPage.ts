import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import ScrollLazyLoader from "../../../Common/Tools/Scroll/ScrollLazyLoader";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DIYCardSelectionPage extends cc.Component implements IWindow {

    @property({ type: cc.Label, visible: true })
    private Label_currentDIYCardCount: cc.Label = null;

    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_DIYList: ScrollLazyLoader = null;

    @property({ type: cc.Node, visible: true })
    private Node_typesetting: cc.Node = null;

    @property({ type: cc.Toggle, visible: true })
    private Toggle_selectAll: cc.Toggle = null;

    @property({ type: cc.Label, visible: true })
    private Label_select: cc.Label = null;

    private selectedCount: number = 0;
    private dataList: any = null;

    protected onLoad(): void {
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_DIYCardSelectionPage, this.UpdatePage, this);
        this.ScrollView_DIYList.node.on("ScrollItemEvent", this.onItemChanged, this);
        this.Toggle_selectAll.node.on("toggle", this.onSelectAll, this);
    }

    protected onDestroy(): void {
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_DIYCardSelectionPage, this.UpdatePage, this);
        this.ScrollView_DIYList?.node?.off("ScrollItemEvent", this.onItemChanged, this);
        this.Toggle_selectAll?.node?.off("toggle", this.onSelectAll, this);
    }

    open(popupData: any): void {
        this.UpdatePage(popupData);
    }

    close(): void {
        PopupManager.closePopup(PopupName.DIYCardSelectionPage);
    }

    /** 更新頁面資訊 */
    private UpdatePage(popupData: any) {
        if (!popupData || !popupData.listData) return;

        this.selectedCount = 0;
        const listData = popupData.listData;
        this.dataList = listData;

        // 更新顯示
        CommonTool.setLabel(this.Label_select, `0`);
        CommonTool.setLabel(this.Label_currentDIYCardCount, `(${listData.length}/${popupData.DIYmaxCard})`);
        this.Toggle_selectAll.isChecked = false;

        this.ScrollView_DIYList.refreshData(listData);
        this.Node_typesetting.active = listData.length === 0;
    }

    /** 勾選全部的 DIY 卡片 */
    private onSelectAll(toggle: cc.Toggle): void {
        const isOn = toggle.isChecked;
        const listData = this.dataList;

        for (const item of listData) {
            if (!item.isPurchased) {
                item.isSelected = isOn;
            }
        }

        this.updateSelectedCount(listData);
        this.ScrollView_DIYList.refreshData(listData);
    }

    /** 玩家單獨選擇卡片時觸發 */
    private onItemChanged(data: any): void {
        const listData = this.dataList;

        for (const item of listData) {
            if (item.id === data.id) {
                item.isSelected = data.isChecked;
                break;
            }
        }

        this.updateSelectedCount(listData);
        CommonTool.setLabel(this.Label_select, `${this.selectedCount}`);
    }

    /** 開啟 DIY 編輯卡片頁面 */
    public OpenDIYEditPage(): void {
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_OpenDIYEditPage);
    }

    /** 按下確認購買 */
    public OnConfirm(): void {
        // 發送勾選卡片
        const cardItem = this.dataList.filter(card => card.isSelected);
        EventManager.getInstance().emit(GameStateUpdate.StateUpdate_DIYConfirmPurchase, cardItem);
        PopupManager.closePopup(PopupName.DIYCardSelectionPage);
    }

    /** 計算當前選取數量並更新 UI */
    private updateSelectedCount(listData: any[]): void {
        this.selectedCount = listData.reduce((count, item) => item.isSelected ? count + 1 : count, 0);
        CommonTool.setLabel(this.Label_select, `${this.selectedCount}`);
    }
}

import PrizeIcon from "../../../Common/Base/component/PrizeIcon";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BingoPrizeList extends MegaComponent {
    // 儲存所有的獎勵圖示元件
    private prizeList: PrizeIcon[] = [];

    /**
     * 元件初始化時呼叫
     * 從子節點中取得所有 PrizeIcon，並初始化顯示的金額
     */
    protected init(): void {
        super.init();
        this.setPrizeList();
    }

    public setPrizeList() {
        // 取得所有子節點中的 PrizeIcon 元件
        this.prizeList = this.node.getComponentsInChildren(PrizeIcon);      
    }

    protected addEventListener(): void {
        super.addEventListener();
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_Canvas, this.onUpdateCanvas, this);
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage, this.updatePrizeAmounts, this);
    }

    protected removeEventListener(): void {
        super.removeEventListener();
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_Canvas, this.onUpdateCanvas, this);
        EventManager.getInstance().off(GameStateUpdate.StateUpdate_OpenPurchasedTicketPage, this.updatePrizeAmounts, this);
    }

    /**
     * 快照更新時呼叫，重新設定獎勵金額
     */
    protected onSnapshot(): void {
        this.updatePrizeAmounts();
    }

    public onUpdateCanvas(): void {
        // 計算分配邏輯
        const containerWidth = this.node.width;
        const iconCount = this.prizeList.length;
        
        // 設定邊距（可根據需要調整）
        const margin = 12; // 左右邊距
        const availableWidth = containerWidth - (margin * 2);
        
        // 多個圖標平均分配
        const spacing = availableWidth / (iconCount - 1);
        const startX = -availableWidth / 2;
        
        this.prizeList.forEach((icon, index) => {
            icon.node.x = startX + (spacing * index);
            // Y軸保持原位置不變
        });

        // console.log(`📍 重新排列${iconCount}個PrizeIcon`, {
        //     containerWidth,
        //     availableWidth,
        //     positions: this.prizeList.map(icon => ({name: icon.name, x: icon.node.x, y: icon.node.y}))
        // });
    }

    /**
     * 根據 data 中的獎勵資料設定每個 PrizeIcon 的金額
     */
    public updatePrizeAmounts(): void {
        const prizeData = this.data.getPrizeDataList();

        // 根據取得的資料更新每個 PrizeIcon 的金額
        for (let i = 0; i < this.prizeList.length; i++) {
            const icon = this.prizeList[i];
            const coin = prizeData[i] ?? 0; // 若無資料則預設為 0
            icon.setCoin(coin);
        }
    }
} 

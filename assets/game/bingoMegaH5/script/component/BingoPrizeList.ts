import PrizeIcon from "../../../Common/Base/component/PrizeIcon";
import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";

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
        // 取得所有子節點中的 PrizeIcon 元件
        this.prizeList = this.node.getComponentsInChildren(PrizeIcon);
    }

    /**
     * 快照更新時呼叫，重新設定獎勵金額
     */
    protected onSnapshot(): void {
        this.updatePrizeAmounts();
    }

    /**
     * 根據 data 中的獎勵資料設定每個 PrizeIcon 的金額
     */
    private updatePrizeAmounts(): void {
        const prizeData = this.data.getPrizeDataList();

        // 根據取得的資料更新每個 PrizeIcon 的金額
        for (let i = 0; i < this.prizeList.length; i++) {
            const icon = this.prizeList[i];
            const coin = prizeData[i] ?? 0; // 若無資料則預設為 0
            icon.setCoin(coin);
        }
    }
} 

import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import PrizeIcon from "./PrizeIcon";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BingoPrizeList extends MegaComponent {
    private PrizelList : PrizeIcon[] = [];

    protected init(): void {
        super.init();
        this.PrizelList = this.node.getComponentsInChildren(PrizeIcon);
    }

    protected onSnapshot(): void {
        this.setPrizeAmount();
    }

    /** 設定中獎卡片金額 */
    setPrizeAmount() {
        let prizeData = this.data.getPrizeDataList();
        for(let i = 0; i < this.PrizelList.length; i++){
            this.PrizelList[i].setCoin(prizeData[i].coin);
        }
    }
}

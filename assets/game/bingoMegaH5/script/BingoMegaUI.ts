import prizeData, { GAME_STATUS } from "../../Common/Base/CommonData";
import MegaComponent from "../../Common/Base/gameMega/MegaComponent";
import CardPurchasePage from "./mainPage/CardPurchasePage";
import PurchasedTicketPage from "./mainPage/PurchasedTicketPage";

const {ccclass, property} = cc._decorator;

/*** 公用圖片與資訊設定管理處 */
@ccclass
export default class BingoMegaUI extends MegaComponent {

    @property({ type: [cc.SpriteFrame], visible: true })
    private ballBG: cc.SpriteFrame[] = [];
    @property({ type: [prizeData], visible: true })
    protected prizeDataList : prizeData[] = []; // 中獎圖示資料
    @property({ type: [cc.SpriteFrame], visible: true })
    protected cardIconBGs : cc.SpriteFrame[] = []; 
    
    protected init(): void {
        super.init();
        let data = {
            ballBG : this.ballBG,
            prizeDataList : this.prizeDataList,
            cardIconBGs : this.cardIconBGs,
        }
        this.data.setInitData(data);
    }
}
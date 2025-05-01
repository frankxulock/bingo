import MegaComponent from "../../../Common/Base/gameMega/MegaComponent";
import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BottomBar extends MegaComponent {
    @property({ type: cc.Label, visible: true })
    private Label_Currency : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_Amount : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_coin : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_wallet : cc.Label = null;
    @property({ type: cc.Node, visible: true })
    private Btn_AddGameCoin : cc.Node = null;

    protected init(): void {
        super.init();
        this.Btn_AddGameCoin.on('click', this.OpenAddGameCoin, this);
    }

    /** 開啟添加遊戲金額頁面 */
    public OpenAddGameCoin() {
        console.log("開啟添加遊戲金額頁面");
    }

    protected onSnapshot(): void {
        this.updateUserData();
    }

    /** 更新用戶資料 */
    private updateUserData() {
        let UserData = this.data.getUserData();
        CommonTool.setLabel(this.Label_Currency, this.data.currency);
        CommonTool.setLabel(this.Label_Amount, UserData.amount);
        CommonTool.setLabel(this.Label_coin, UserData.coin);
        CommonTool.setLabel(this.Label_wallet, UserData.wallet);
    }
}

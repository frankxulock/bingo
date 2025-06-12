import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import ToastManager from "../../../Common/Tools/Toast/ToastManager";
import CardIcon from "../component/Card/CardIcon";
import ScrollLazyLoader from "../../../Common/Tools/Scroll/ScrollLazyLoader";
import NumberToggle from "../../../Common/Base/component/NumberToggle";
import { HttpServer } from "../HttpServer";

const { ccclass, property } = cc._decorator;

// 常數定義
const TOTAL_NUMBERS = 75;                    // 總共 75 個號碼
const GROUP_SIZE = 15;                       // 每組 15 個號碼
const MAX_ALLOWED_PER_GROUP = 5;             // 一般組最大選擇數
const MAX_ALLOWED_IN_CENTER_GROUP = 4;       // 中間組（第3組）最大只能選4個號碼
const ALLCARD = 24;                          // 總共選24個號碼

@ccclass
export default class DIYEditPage extends cc.Component implements IWindow {

    @property({ type: cc.Label, visible: true })
    private Label_currentDIYCardCount: cc.Label = null;

    @property({ type: ScrollLazyLoader, visible: true })
    private ScrollView_nalyzeData: ScrollLazyLoader = null;

    // 卡片 UI 顯示節點（對應選號顯示）
    @property({ type: cc.Node, visible: true })
    private Node_NumberTxtGroup: cc.Node = null;
    private CardTxts: cc.Label[] = [];
    private cardText: cc.Color[] = [
        new cc.Color(29, 29, 29),
        new cc.Color(255, 255, 255),
        new cc.Color(254, 88, 42)
    ];

    // 選號按鈕 UI 節點
    @property({ type: cc.Node, visible: true })
    private Node_NumberToggleGroup: cc.Node = null;
    private NumberToggles: NumberToggle[] = [];
    private toggleGroups: NumberToggle[][] = [];

    private editCard: any = null;
    // 來自外部的冷熱正常號碼資料
    private hotBalls: number[] = [];
    private coldBalls: number[] = [];
    private normalBalls: number[] = [];

    // 記錄使用者已選號碼
    private selectedNumbers: Set<number> = new Set();

    /**
     * 彈窗打開時初始化
     */
    open(data: any): void {
        // 儲存熱冷正常號碼來源
        this.hotBalls = data.hotBalls;
        this.coldBalls = data.coldBalls;
        this.normalBalls = data.normalBalls;

        // 取得 CardIcon 元件
        if (this.CardTxts.length === 0) {
            this.CardTxts = this.Node_NumberTxtGroup.getComponentsInChildren(cc.Label);
        }

        // 初始化選號按鈕及分組
        if (this.NumberToggles.length === 0) {
            this.NumberToggles = this.Node_NumberToggleGroup.getComponentsInChildren(NumberToggle);
            for (let i = 0; i < this.NumberToggles.length; i += GROUP_SIZE) {
                this.toggleGroups.push(this.NumberToggles.slice(i, i + GROUP_SIZE));
            }
            this.initToggleEvents(); // 設置按鈕事件
        }

        // 根據編輯資料預設選號狀態
        this.initializeToggleStates(data.editCard);
        this.ScrollView_nalyzeData.refreshData(data.ballDisplayInfo);
        this.updateCardIconsBySelected(); // 同步更新卡片內容
        CommonTool.setLabel(this.Label_currentDIYCardCount, `#${data.id}`);
    }

    /**
     * 關閉彈窗
     */
    close(): void {
        PopupManager.closePopup(PopupName.DIYEditPage);
    }

    /**
     * 為每個按鈕綁定事件
     */
    private initToggleEvents(): void {
        this.NumberToggles.forEach((toggle, index) => {
            toggle.node.on("ItemEvent", this.onToggleChanged, this);
        });
    }

    /**
     * 初始化號碼按鈕選中狀態（從編輯卡資料還原）
     */
    private initializeToggleStates(editCard: any): void {
        this.editCard = editCard;
        this.selectedNumbers.clear();
        if (editCard != null) {
            const cardInfo: number[] = editCard.cardInfo;
            this.selectedNumbers = new Set<number>(cardInfo.filter(n => n != null));
        }

        // 設定每個按鈕的資料與狀態
        this.NumberToggles.forEach((toggle, index) => {
            const number = index + 1;
            const isSelected = this.selectedNumbers.has(number);
            toggle.setData({
                id: index,
                num: number,
                isSelected,
                isPurchased: false
            });
            toggle.setChecked(isSelected);
        });
    }

    /**
     * 按鈕選擇變化事件
     */
    private onToggleChanged(evt: { id: number; isChecked: boolean }): void {
        const toggle = this.NumberToggles[evt.id];
        if (!toggle) return;

        // 計算目前分組內選中數量
        const groupIndex = Math.floor(evt.id / GROUP_SIZE);
        const group = this.toggleGroups[groupIndex];
        const selectedCount = group.filter(t => t.getData()?.isSelected).length;
        const maxAllowed = (groupIndex === 2) ? MAX_ALLOWED_IN_CENTER_GROUP : MAX_ALLOWED_PER_GROUP;

        // 超過限制提示並強制取消
        if (evt.isChecked && selectedCount > maxAllowed) {
            toggle.setChecked(false);
            let bingo = ["B", "I", "N", "G", "O"];
            ToastManager.showToast(`Group ${bingo[groupIndex]} has reached the limit (you can select up to ${maxAllowed} numbers). Please deselect other numbers first.`);
            return;
        }

        // 更新選號狀態
        toggle.setChecked(evt.isChecked);
        const number = toggle.getData().num;
        evt.isChecked ? this.selectedNumbers.add(number) : this.selectedNumbers.delete(number);
        this.updateCardIconsBySelected(); // 同步卡片顯示
    }

    /**
     * 根據選中號碼更新 UI 顯示（5x5 卡片）
     */
    private updateCardIconsBySelected(): void {
        const sorted = Array.from(this.selectedNumbers).sort((a, b) => a - b);
        const rows: number[][] = [[], [], [], [], []];

        // 分組號碼分類至五排
        for (let num of sorted) {
            const row = Math.floor((num - 1) / GROUP_SIZE);
            rows[row].push(num);
        }

        // 展平成卡片顯示內容，中心位置為空
        const flattened: (string | null)[] = [];
        for (let row = 0; row < 5; row++) {
            for (let i = 0; i < 5; i++) {
                if (row === 2 && i === 2) {
                    flattened.push(null);
                } else {
                    const val = rows[row].shift();
                    flattened.push(val !== undefined ? val.toString() : "");
                }
            }
        }

        // 更新卡片 UI 顯示文字
        this.CardTxts.forEach((card, index) => {
            let txt = flattened[index] ?? "DIY";
            let color = (flattened[index] == null) ? 1 : 0;
            this.setLabel(card, txt, color);
        });
    }

    /**
     * 熱門號碼隨機選擇
     */
    public OnPoular(): void {
        this.selectRandomFromSource(this.hotBalls);
    }

    /**
     * 冷門號碼隨機選擇
     */
    public OnObscure(): void {
        this.selectRandomFromSource(this.coldBalls);
    }

    /**
     * 根據來源 pool 隨機補足每組號碼
     */
    private selectRandomFromSource(sourceBalls: number[]): void {
        const selected = new Set<number>(this.selectedNumbers); // 保留使用者已選

        for (let groupIndex = 0; groupIndex < 5; groupIndex++) {
            const group = this.toggleGroups[groupIndex];
            const current = group.filter(t => t.getData()?.isSelected).map(t => t.getData().num);
            const maxAllowed = (groupIndex === 2) ? MAX_ALLOWED_IN_CENTER_GROUP : MAX_ALLOWED_PER_GROUP;
            const needed = maxAllowed - current.length;
            if (needed < 0) continue;

            const rangeStart = groupIndex * GROUP_SIZE + 1;
            const rangeEnd = rangeStart + GROUP_SIZE - 1;
            let added = 0;
            let attempts = 0;

            // 補足號碼（先熱冷，再正常，再全範圍）
            while (added < needed && attempts < 100) {
                let pool = sourceBalls.filter(n => n >= rangeStart && n <= rangeEnd && !selected.has(n));
                if (pool.length === 0) {
                    pool = this.normalBalls.filter(n => n >= rangeStart && n <= rangeEnd && !selected.has(n));
                }
                if (pool.length === 0) {
                    pool = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1)
                        .filter(n => n >= rangeStart && n <= rangeEnd && !selected.has(n));
                }
                if (pool.length === 0) break;

                const pick = pool[Math.floor(Math.random() * pool.length)];
                selected.add(pick);
                added++;
                attempts++;
            }
        }

        // 更新狀態與 UI
        this.selectedNumbers = selected;
        this.NumberToggles.forEach(toggle => {
            const num = toggle.getData().num;
            toggle.setChecked(selected.has(num));
        });
        this.updateCardIconsBySelected();
    }

    /*** 儲存卡片資料 */
    public OnSave(): void {
        // 將選中的數字排序
        const sorted = Array.from(this.selectedNumbers).sort((a, b) => a - b);

        // 檢查是否已選滿 24 個數字
        if (sorted.length === ALLCARD) {
            const middleIndex = Math.floor(ALLCARD / 2);

            // 插入 "DIY" 在中間（轉為 (number|string)[]）
            const withDIY: (number | string)[] = [...sorted];
            withDIY.splice(middleIndex, 0, "DIY");

            // 轉為字串並送出
            const resultString = withDIY.join(",");

            sorted.splice(middleIndex, 0, null);
            if(this.editCard) {
                HttpServer.DIYUpdate(resultString, this.editCard.id)
                .then(results => {
                    // 更新 editCard（保留原始數字陣列）
                    if (this.editCard) {
                        this.editCard.cardInfo = sorted;
                    }
                    // 發送事件
                    EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SaveDIYCards, this.editCard || sorted);
                    // 關閉頁面並清除狀態
                    this.close();
                    this.editCard = null;
                })
            }else {
                HttpServer.DIYCreate(resultString, window.url.getGame())
                .then(results => {
                    
                    // 更新 editCard（保留原始數字陣列）
                    if (this.editCard) {
                        this.editCard.cardInfo = sorted;
                    }
                    // 發送事件
                    EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SaveDIYCards, this.editCard || sorted);
                    // 關閉頁面並清除狀態
                    this.close();
                    this.editCard = null;
                });
            }
        } else {
            ToastManager.showToast("The card does not have all 24 numbers selected.");
        }
    }

    /**
     * 重置選號與 UI
     */
    public OnReset(): void {
        this.selectedNumbers.clear();
        this.NumberToggles.forEach(toggle => toggle.setChecked(false));
        this.CardTxts.forEach( (card, index)=> {
            let showDIY = (index == (ALLCARD / 2));
            let txt = (showDIY ? "DIY" : "");
            let color = showDIY ? 1 : 0;
            this.setLabel(card, txt, color);
        });
    }

    /**
     * 設定顯示的文字內容
     * @param txt 要設定的文字內容
     */
    public setLabel(text : cc.Label , txt: string, numberItem : number) {
        text.node.color = this.cardText[numberItem];
        CommonTool.setLabel(text, txt);
    }
}

import GameRecordPage from "../../../bingoMegaH5/script/mainPage/GameRecordPage";

const {ccclass, property} = cc._decorator;

/**
 * 日期選擇器組件
 * 功能：顯示42天日曆，當天在最後一週，只能選擇最近30天
 * 優化：減少重複計算，提高性能和可讀性
 */
@ccclass
export default class DateInstance extends cc.Component {
    // ==================== UI 組件 ====================
    @property({ type: cc.Label }) private Label_YearMonth: cc.Label = null;
    @property({ type: [cc.Node] }) private selectBGs: cc.Node[] = [];
    @property({ type: cc.Node }) private Node_select_start: cc.Node = null;
    @property({ type: cc.Node }) private Node_select_end: cc.Node = null;
    @property({ type: cc.Node }) private date_Group: cc.Node = null;
    @property({ type: cc.ToggleContainer }) private ToggleContainer_SelectTimeRange: cc.ToggleContainer = null;
    @property({ type: GameRecordPage }) private GameRecordPage: GameRecordPage = null;

    // ==================== 私有屬性 ====================
    private dates: cc.Label[] = [];
    private selectedStartDate: Date = null;
    private selectedEndDate: Date = null;
    private currentState: number = 0;
    private today: Date = new Date();

    // ==================== 常量配置 ====================
    /** 日期顏色配置：[可選, 不可選, 選中, 區間] */
    private readonly dateColors = [
        new cc.Color(90, 90, 90),      // 可選
        new cc.Color(153, 153, 153),   // 不可選
        new cc.Color(255, 255, 255),   // 選中日期
        new cc.Color(254, 88, 42),     // 區間中間
    ];

    /** 快速選擇天數配置 */
    private readonly quickRanges = [7, 30];

    // ==================== 公共方法 ====================
    /**
     * 打開日期選擇器
     */
    open(start: number, end: number, state: number) {
        this.node.active = true;
        this.currentState = state;
        
        // 更新今天的日期
        this.today = new Date();
        
        this.initializeComponents();
        this.setSelectedDates(start, end, state);
        this.updateCalendar();
    }

    close() {
        this.node.active = false;
    }

    Apply() {
        if(this.GameRecordPage){
            // 創建開始日期的副本，設置為當天開始時間（00:00:00）
            const startDate = new Date(this.selectedStartDate);
            startDate.setHours(0, 0, 0, 0);
            
            // 創建結束日期的副本，設置為當天結束時間（23:59:59）
            const endDate = new Date(this.selectedEndDate);
            endDate.setHours(23, 59, 59, 999);
            
            this.GameRecordPage.setDate(startDate, endDate);
            this.close();
        }
    }

    // ==================== 私有方法 ====================
    /**
     * 初始化組件（只執行一次）
     */
    private initializeComponents() {
        if (this.dates.length > 0) return;

        // 初始化日期格子
        this.dates = this.date_Group.getComponentsInChildren(cc.Label);
        this.dates.forEach((label, index) => {
            this.setupDateButton(label, index);
        });

        // 初始化快速選擇
        this.setupQuickRangeToggles();
    }

    /**
     * 設置日期按鈕
     */
    private setupDateButton(label: cc.Label, index: number) {
        if (!label.node.getComponent(cc.Button)) {
            const btn = label.node.addComponent(cc.Button);
            btn.transition = cc.Button.Transition.NONE;
        }
        // 添加新的事件監聽器
        label.node.on(cc.Node.EventType.TOUCH_END, () => this.onClickDate(index), this);
    }

    /**
     * 設置快速選擇開關
     */
    private setupQuickRangeToggles() {
        const container = this.ToggleContainer_SelectTimeRange;
        if (container.node['_quickRangeInited']) return;

        container.toggleItems.forEach((toggle, index) => {
            toggle.node.on('toggle', () => this.setQuickRange(this.quickRanges[index]), this);
        });
        container.node['_quickRangeInited'] = true;
    }

    /**
     * 設置選中的日期
     */
    private setSelectedDates(start: number, end: number, state: number) {
        this.selectedStartDate = new Date(start);
        this.selectedEndDate = new Date(end);
        this.currentState = state;
    }

    /**
     * 更新日曆顯示
     */
    private updateCalendar() {
        this.hideSelectionMarkers();
        
        // 更新月份顯示
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        if (this.Label_YearMonth) {
            this.Label_YearMonth.string = monthNames[this.today.getMonth()];
        }
        
        // 計算結束日期（當天）和它的星期
        const endDate = new Date(this.today);
        const endDayOfWeek = endDate.getDay(); // 0 = Sunday, 6 = Saturday
        
        // 計算需要顯示的最後一個位置（確保當天在正確的星期幾位置）
        const daysToAdd = 6 - endDayOfWeek; // 補足到週六
        endDate.setDate(endDate.getDate() + daysToAdd);
        
        // 計算起始日期（往前41天，總共顯示42天）
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 41);

        // 生成42天的日期陣列
        const datesToShow: Date[] = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            datesToShow.push(d);
        }

        // 更新日期格子
        this.dates.forEach((label, index) => {
            if (!label || !label.node) return;

            const date = datesToShow[index];
            const isSelectable = this.isDateSelectable(date);
            
            // 更新日期顯示
            this.updateSingleDateCell(index, {
                actualDate: date,
                dayNumber: date.getDate(),
                isSelectable: isSelectable
            });

            // 設置節點狀態
            label.node.active = true;
            
            // 更新按鈕狀態
            const button = label.node.getComponent(cc.Button);
            if (button) {
                button.interactable = isSelectable;
                button.enableAutoGrayEffect = true;
            }
        });

        this.updateSelectBGs();
    }

    /**
     * 檢查日期是否可選擇（最近30天內）
     */
    private isDateSelectable(date: Date): boolean {
        if (!date) return false;
        
        const minSelectableDate = new Date(this.today);
        minSelectableDate.setDate(this.today.getDate() - 29); // 可選範圍：今天往前29天（共30天）
        minSelectableDate.setHours(0, 0, 0, 0);
        
        const maxSelectableDate = new Date(this.today);
        maxSelectableDate.setHours(23, 59, 59, 999);
        
        return date >= minSelectableDate && date <= maxSelectableDate;
    }

    /**
     * 隱藏選擇標記
     */
    private hideSelectionMarkers() {
        this.Node_select_start.active = false;
        this.Node_select_end.active = false;
    }

    /**
     * 更新單個日期格子
     */
    private updateSingleDateCell(index: number, cellInfo: any) {
        const { actualDate, dayNumber, isSelectable } = cellInfo;
        const label = this.dates[index];
        if (!label || !label.node) return;

        // 設置日期文字
        label.string = dayNumber.toString();
        
        // 設置按鈕狀態
        const button = label.node.getComponent(cc.Button);
        if (button) {
            button.interactable = isSelectable;
        }
        
        // 應用選擇樣式
        const selectionType = this.getSelectionType(actualDate);
        this.applySelectionStyle(label, selectionType, isSelectable);
    }

    /**
     * 獲取選擇類型
     */
    private getSelectionType(actualDate: Date): 'start' | 'end' | 'both' | 'between' | 'normal' {
        const isStart = this.isSameDate(actualDate, this.selectedStartDate);
        const isEnd = this.selectedEndDate && this.isSameDate(actualDate, this.selectedEndDate);
        const isBetween = this.selectedStartDate && this.selectedEndDate &&
                         actualDate > this.selectedStartDate && actualDate < this.selectedEndDate;

        if (isStart && isEnd) return 'both';
        if (isStart) return 'start';
        if (isEnd) return 'end';
        if (isBetween) return 'between';
        return 'normal';
    }

    /**
     * 應用選擇樣式
     */
    private applySelectionStyle(label: cc.Label, type: string, isSelectable: boolean) {
        const node = label.node;
        
        switch (type) {
            case 'both':
            case 'start':
                node.color = this.dateColors[2];
                this.Node_select_start.setPosition(node.getPosition());
                this.Node_select_start.active = true;
                break;
            case 'end':
                node.color = this.dateColors[2];
                this.Node_select_end.setPosition(node.getPosition());
                this.Node_select_end.active = true;
                break;
            case 'between':
                node.color = this.dateColors[3];
                break;
            default:
                node.color = this.dateColors[isSelectable ? 0 : 1];
        }
    }

    /**
     * 比較兩個日期是否相同
     */
    private isSameDate(a: Date, b: Date): boolean {
        return a && b && 
               a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
    }

    /**
     * 處理日期點擊
     */
    private onClickDate(index: number) {
        const label = this.dates[index];
        if (!label || !label.node || !label.node.getComponent(cc.Button).interactable) {
            return;
        }

        // 計算點擊的日期
        const endDate = new Date(this.today);
        const endDayOfWeek = endDate.getDay();
        const daysToAdd = 6 - endDayOfWeek;
        endDate.setDate(endDate.getDate() + daysToAdd);
        
        const clickedDate = new Date(endDate);
        clickedDate.setDate(endDate.getDate() - (41 - index));

        // 檢查日期是否在可選範圍內
        if (!this.isDateSelectable(clickedDate)) {
            return;
        }

        // 更新選擇的日期
        if (this.currentState === 0) {
            // 選擇開始日期
            this.selectedStartDate = new Date(clickedDate);
            if (!this.selectedEndDate || clickedDate > this.selectedEndDate) {
                this.selectedEndDate = new Date(clickedDate);
            }
        } else {
            // 選擇結束日期
            this.selectedEndDate = new Date(clickedDate);
            if (!this.selectedStartDate || clickedDate < this.selectedStartDate) {
                this.selectedStartDate = new Date(clickedDate);
            }
        }

        // 更新日曆顯示
        this.updateCalendar();
    }

    /**
     * 設置快速選擇範圍
     */
    private setQuickRange(days: number) {
        const end = new Date(this.today);
        end.setHours(23, 59, 59, 999);
        
        const start = new Date(this.today);
        start.setDate(end.getDate() - (days - 1));
        start.setHours(0, 0, 0, 0);
        
        this.selectedStartDate = start;
        this.selectedEndDate = end;
        this.updateCalendar();
    }

    /**
     * 更新選擇背景
     */
    private updateSelectBGs() {
        // 隱藏所有背景
        this.selectBGs.forEach(bg => bg && (bg.active = false));

        if (!this.hasValidSelection()) return;

        // 按行處理背景
        for (let row = 0; row < 6; row++) {
            this.updateRowBackground(row);
        }
    }

    /**
     * 檢查是否有有效選擇
     */
    private hasValidSelection(): boolean {
        return this.selectedStartDate && this.selectedEndDate && 
               this.selectedStartDate <= this.selectedEndDate;
    }

    /**
     * 更新單行背景
     */
    private updateRowBackground(row: number) {
        const rowStart = row * 7;
        const rowEnd = rowStart + 6;
        
        let selectionStart = -1;
        let selectionEnd = -1;

        // 計算結束日期
        const endDate = new Date(this.today);
        const endDayOfWeek = endDate.getDay();
        const daysToAdd = 6 - endDayOfWeek;
        endDate.setDate(endDate.getDate() + daysToAdd);

        // 確保開始和結束日期包含完整的時間
        const startTime = new Date(this.selectedStartDate);
        startTime.setHours(0, 0, 0, 0);
        const endTime = new Date(this.selectedEndDate);
        endTime.setHours(23, 59, 59, 999);

        for (let i = rowStart; i <= rowEnd; i++) {
            const date = new Date(endDate);
            date.setDate(endDate.getDate() - (41 - i));
            // 設置為當天的開始時間，確保日期比較準確
            date.setHours(0, 0, 0, 0);

            if (date >= startTime && date <= endTime) {
                if (selectionStart === -1) selectionStart = i;
                selectionEnd = i;
            }
        }

        if (selectionStart !== -1 && selectionEnd !== -1) {
            const startNode = this.dates[selectionStart].node;
            const endNode = this.dates[selectionEnd].node;
            
            const leftBoundary = startNode.x - 15;
            const rightBoundary = endNode.x + 15;
            const centerX = (leftBoundary + rightBoundary) / 2;
            const bgWidth = rightBoundary - leftBoundary;
            
            const bg = this.selectBGs[row];
            if (bg) {
                bg.active = true;
                bg.setPosition(centerX, startNode.y);
                bg.width = bgWidth;
            }
        }
    }
}

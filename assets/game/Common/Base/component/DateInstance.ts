import GameRecordPage from "../../../bingoMegaH5/script/mainPage/GameRecordPage";

const {ccclass, property} = cc._decorator;

/**
 * 日期选择器组件
 * 功能：显示日历，支持日期范围选择，限制在过去30天内
 * 优化：减少重复计算，提高性能和可读性
 */
@ccclass
export default class DateInstance extends cc.Component {
    // ==================== UI 组件 ====================
    @property({ type: cc.Node }) private Btn_PreviousYear: cc.Node = null;
    @property({ type: cc.Node }) private Btn_PreviousMonth: cc.Node = null;
    @property({ type: cc.Node }) private Btn_NextYear: cc.Node = null;
    @property({ type: cc.Node }) private Btn_NextMonth: cc.Node = null;
    @property({ type: cc.Label }) private Label_YearMonth: cc.Label = null;
    @property({ type: [cc.Node] }) private selectBGs: cc.Node[] = [];
    @property({ type: cc.Node }) private Node_select_start: cc.Node = null;
    @property({ type: cc.Node }) private Node_select_end: cc.Node = null;
    @property({ type: cc.Node }) private date_Group: cc.Node = null;
    @property({ type: cc.ToggleContainer }) private ToggleContainer_SelectTimeRange: cc.ToggleContainer = null;
    @property({ type: GameRecordPage }) private GameRecordPage: GameRecordPage = null;

    // ==================== 私有属性 ====================
    private dates: cc.Label[] = [];
    private currentYear: number = 0;
    private currentMonth: number = 0;
    private selectedStartDate: Date = null;
    private selectedEndDate: Date = null;
    private currentState: number = 0;

    // ==================== 常量配置 ====================
    /** 日期颜色配置：[当月, 其他月, 选中, 区间, 不可选] */
    private readonly dateColors = [
        new cc.Color(90, 90, 90),      // 当月可选
        new cc.Color(153, 153, 153),   // 其他月
        new cc.Color(255, 255, 255),   // 选中日期
        new cc.Color(254, 88, 42),     // 区间中间
        new cc.Color(153, 153, 153),   // 不可选
    ];

    /** 系统日期配置 */
    private readonly today = new Date();
    private readonly minDate = (() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
    })();

    /** 快速选择天数配置 */
    private readonly quickRanges = [7, 30];

    // ==================== 公共方法 ====================
    /**
     * 打开日期选择器
     * @param start 开始日期时间戳
     * @param end 结束日期时间戳  
     * @param state 当前状态 (0:选择开始日期, 1:选择结束日期)
     */
    open(start: number, end: number, state: number) {
        this.Btn_PreviousYear.active = false;
        this.Btn_NextYear.active = false;
        this.node.active = true;
        this.currentState = state;
        this.initializeComponents();
        this.setSelectedDates(start, end, state);
        this.updateCalendar();
    }

    close() {
        this.node.active = false;
    }

    Apply() {
        if(this.GameRecordPage){
            // 创建开始日期的副本，设置为当天开始时间（00:00:00）
            const startDate = new Date(this.selectedStartDate);
            startDate.setHours(0, 0, 0, 0);
            
            // 创建结束日期的副本，设置为当天结束时间（23:59:59）
            const endDate = new Date(this.selectedEndDate);
            endDate.setHours(23, 59, 59, 999);
            
            this.GameRecordPage.setDate(startDate, endDate);
            this.close();
        }
    }

    // ==================== 导航按钮事件 ====================
    OnPreviousYear() {
        if (this.canNavigateToYear(this.currentYear - 1)) {
            this.currentYear--;
            this.updateCalendar();
        }
    }

    OnNextYear() {
        if (this.canNavigateToYear(this.currentYear + 1)) {
            this.currentYear++;
            this.updateCalendar();
        }
    }

    OnPreviousMonth() {
        if (this.canNavigateToMonth(this.currentYear, this.currentMonth - 1)) {
            this.navigateMonth(-1);
            this.updateCalendar();
        }
    }

    OnNextMonth() {
        if (this.canNavigateToMonth(this.currentYear, this.currentMonth + 1)) {
            this.navigateMonth(1);
            this.updateCalendar();
        }
    }

    // ==================== 私有方法 ====================
    /**
     * 初始化组件（只执行一次）
     */
    private initializeComponents() {
        if (this.dates.length > 0) return;

        // 初始化日期格子
        this.dates = this.date_Group.getComponentsInChildren(cc.Label);
        this.dates.forEach((label, index) => {
            this.setupDateButton(label, index);
        });

        // 初始化快速选择
        this.setupQuickRangeToggles();
    }

    /**
     * 设置日期按钮
     */
    private setupDateButton(label: cc.Label, index: number) {
        if (!label.node.getComponent(cc.Button)) {
            const btn = label.node.addComponent(cc.Button);
            btn.transition = cc.Button.Transition.NONE;
        }
        label.node.on(cc.Node.EventType.TOUCH_END, () => this.onClickDate(index), this);
    }

    /**
     * 设置快速选择开关
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
     * 设置选中的日期
     */
    private setSelectedDates(start: number, end: number, state: number) {
        this.selectedStartDate = new Date(start);
        this.selectedEndDate = new Date(end);
        const baseDate = state === 0 ? this.selectedStartDate : this.selectedEndDate;
        this.currentYear = baseDate.getFullYear();
        this.currentMonth = baseDate.getMonth();
    }

    /**
     * 更新日历显示（主要方法）
     */
    private updateCalendar() {
        const monthInfo = this.getMonthInfo();
        this.updateYearMonthLabel();
        this.hideSelectionMarkers();
        this.updateDateCells(monthInfo);
        this.updateNavButtons();
        this.updateSelectBGs();
    }

    /**
     * 获取月份信息（减少重复计算）
     */
    private getMonthInfo() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const firstWeekDay = firstDay.getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // 上个月信息
        const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
        const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
        
        // 下个月信息
        const nextMonth = this.currentMonth === 11 ? 0 : this.currentMonth + 1;
        const nextYear = this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear;

        return {
            firstWeekDay, daysInMonth, daysInPrevMonth,
            prevMonth, prevYear, nextMonth, nextYear
        };
    }

    /**
     * 更新年月标签
     */
    private updateYearMonthLabel() {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.Label_YearMonth.string = monthNames[this.currentMonth];
    }

    /**
     * 隐藏选择标记
     */
    private hideSelectionMarkers() {
        this.Node_select_start.active = false;
        this.Node_select_end.active = false;
    }

    /**
     * 更新日期格子
     */
    private updateDateCells(monthInfo: any) {
        for (let i = 0; i < this.dates.length; i++) {
            const cellInfo = this.calculateCellInfo(i, monthInfo);
            this.updateSingleDateCell(i, cellInfo);
        }
    }

    /**
     * 计算单个格子信息
     */
    private calculateCellInfo(index: number, monthInfo: any) {
        const { firstWeekDay, daysInMonth, daysInPrevMonth, prevMonth, prevYear, nextMonth, nextYear } = monthInfo;
        
        let actualDate: Date;
        let dayNumber: number;
        let isCurrentMonth: boolean;

        if (index < firstWeekDay) {
            // 上个月
            dayNumber = daysInPrevMonth - (firstWeekDay - index - 1);
            actualDate = new Date(prevYear, prevMonth, dayNumber);
            isCurrentMonth = false;
        } else if (index < firstWeekDay + daysInMonth) {
            // 当月
            dayNumber = index - firstWeekDay + 1;
            actualDate = new Date(this.currentYear, this.currentMonth, dayNumber);
            isCurrentMonth = true;
        } else {
            // 下个月
            dayNumber = index - firstWeekDay - daysInMonth + 1;
            actualDate = new Date(nextYear, nextMonth, dayNumber);
            isCurrentMonth = false;
        }

        return { actualDate, dayNumber, isCurrentMonth };
    }

    /**
     * 更新单个日期格子
     */
    private updateSingleDateCell(index: number, cellInfo: any) {
        const { actualDate, dayNumber, isCurrentMonth } = cellInfo;
        const label = this.dates[index];
        const isSelectable = this.isDateSelectable(actualDate);

        if (!isSelectable) {
            this.setUnselectableCell(label, dayNumber);
            return;
        }

        this.setSelectableCell(label, dayNumber, actualDate, isCurrentMonth, index);
    }

    /**
     * 设置不可选择的格子
     */
    private setUnselectableCell(label: cc.Label, dayNumber: number) {
        label.string = dayNumber.toString();
        label.node.color = this.dateColors[4];
        label.node.getComponent(cc.Button).interactable = false;
    }

    /**
     * 设置可选择的格子
     */
    private setSelectableCell(label: cc.Label, dayNumber: number, actualDate: Date, isCurrentMonth: boolean, index: number) {
        label.string = dayNumber.toString();
        label.node.getComponent(cc.Button).interactable = true;
        
        const selectionType = this.getSelectionType(actualDate);
        this.applySelectionStyle(label, selectionType, isCurrentMonth, index);
    }

    /**
     * 获取选择类型
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
     * 应用选择样式
     */
    private applySelectionStyle(label: cc.Label, type: string, isCurrentMonth: boolean, index: number) {
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
                node.color = this.dateColors[isCurrentMonth ? 0 : 1];
        }
    }

    /**
     * 更新导航按钮状态
     */
    private updateNavButtons() {
        // this.Btn_PreviousYear.active = this.canNavigateToYear(this.currentYear - 1);
        // this.Btn_NextYear.active = this.canNavigateToYear(this.currentYear + 1);
        this.Btn_PreviousMonth.active = this.canNavigateToMonth(this.currentYear, this.currentMonth - 1);
        this.Btn_NextMonth.active = this.canNavigateToMonth(this.currentYear, this.currentMonth + 1);
    }

    /**
     * 检查是否可以导航到指定年份
     */
    private canNavigateToYear(year: number): boolean {
        if (year < this.minDate.getFullYear() || year > this.today.getFullYear()) return false;
        if (year === this.today.getFullYear() && this.currentMonth > this.today.getMonth()) return false;
        return true;
    }

    /**
     * 检查是否可以导航到指定月份
     */
    private canNavigateToMonth(year: number, month: number): boolean {
        const targetDate = new Date(year, month, 1);
        if (targetDate < this.minDate) return false;
        if (year === this.today.getFullYear() && month > this.today.getMonth()) return false;
        return true;
    }

    /**
     * 导航月份
     */
    private navigateMonth(direction: number) {
        this.currentMonth += direction;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
    }

    /**
     * 检查日期是否可选择
     */
    private isDateSelectable(date: Date): boolean {
        return date >= this.minDate && date <= this.today;
    }

    /**
     * 比较两个日期是否相同
     */
    private isSameDate(a: Date, b: Date): boolean {
        return a && b && 
               a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
    }

    /**
     * 处理日期点击
     */
    private onClickDate(index: number) {
        const label = this.dates[index];
        const day = parseInt(label.string);
        
        if (isNaN(day) || !label.node.getComponent(cc.Button).interactable) return;

        const clickedDate = this.calculateClickedDate(index, day);
        if (!this.isDateSelectable(clickedDate)) return;

        this.updateSelectedDates(clickedDate);
        this.updateCalendar();
    }

    /**
     * 计算点击的日期
     */
    private calculateClickedDate(index: number, day: number): Date {
        const monthInfo = this.getMonthInfo();
        const { firstWeekDay, daysInMonth, prevMonth, prevYear, nextMonth, nextYear } = monthInfo;

        if (index < firstWeekDay) {
            return new Date(prevYear, prevMonth, day);
        } else if (index < firstWeekDay + daysInMonth) {
            return new Date(this.currentYear, this.currentMonth, day);
        } else {
            return new Date(nextYear, nextMonth, day);
        }
    }

    /**
     * 更新选中的日期
     */
    private updateSelectedDates(clickedDate: Date) {
        if (this.currentState === 0) {
            this.selectedStartDate = clickedDate;
            if (!this.selectedEndDate || this.selectedEndDate < clickedDate) {
                this.selectedEndDate = clickedDate;
            }
        } else {
            this.selectedEndDate = clickedDate;
            if (!this.selectedStartDate || this.selectedStartDate > clickedDate) {
                this.selectedStartDate = clickedDate;
            }
        }
    }

    /**
     * 设置快速选择范围
     */
    private setQuickRange(days: number) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days + 1);
        
        this.selectedStartDate = start;
        this.selectedEndDate = end;
        this.currentYear = end.getFullYear();
        this.currentMonth = end.getMonth();
        this.updateCalendar();
    }

    /**
     * 更新选择背景（优化版本）
     */
    private updateSelectBGs() {
        // 隐藏所有背景
        this.selectBGs.forEach(bg => bg && (bg.active = false));

        if (!this.hasValidSelection()) return;

        const monthInfo = this.getMonthInfo();
        
        // 按行处理背景
        for (let row = 0; row < 6; row++) {
            this.updateRowBackground(row, monthInfo);
        }
    }

    /**
     * 检查是否有有效选择
     */
    private hasValidSelection(): boolean {
        return this.selectedStartDate && this.selectedEndDate && 
               this.selectedStartDate < this.selectedEndDate;
    }

    /**
     * 更新单行背景
     */
    private updateRowBackground(row: number, monthInfo: any) {
        const rowRange = this.getRowSelectionRange(row, monthInfo);
        if (!rowRange) return;

        const { start, end } = rowRange;
        const startNode = this.dates[start].node;
        const endNode = this.dates[end].node;
        
        // 计算背景属性
        const leftBoundary = startNode.x - 15;
        const rightBoundary = endNode.x + 15;
        const centerX = (leftBoundary + rightBoundary) / 2;
        const bgWidth = rightBoundary - leftBoundary;
        
        // 设置背景
        const bg = this.selectBGs[row];
        bg.active = true;
        bg.setPosition(centerX, startNode.y);
        bg.width = bgWidth;
    }

    /**
     * 获取行选择范围
     */
    private getRowSelectionRange(row: number, monthInfo: any) {
        const rowStart = row * 7;
        const rowEnd = rowStart + 6;
        let selectionStart = -1;
        let selectionEnd = -1;

        for (let i = rowStart; i <= rowEnd; i++) {
            const label = this.dates[i];
            const day = parseInt(label.string);
            
            if (isNaN(day) || !label.node.getComponent(cc.Button).interactable) continue;

            const actualDate = this.calculateClickedDate(i, day);
            if (actualDate >= this.selectedStartDate && actualDate <= this.selectedEndDate) {
                if (selectionStart === -1) selectionStart = i;
                selectionEnd = i;
            }
        }

        return selectionStart !== -1 && selectionEnd !== -1 ? 
               { start: selectionStart, end: selectionEnd } : null;
    }
}

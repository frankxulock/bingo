const { ccclass, property } = cc._decorator;

/**
 * 虚拟滚动视图组件
 * 提供高性能的长列表滚动功能，支持多列布局和动态高度
 * 支持横向和纵向滚动模式
 */
@ccclass
export default class VirtualScrollView extends cc.Component {
    @property(cc.ScrollView)
    private scrollView: cc.ScrollView = null; // ScrollView组件引用

    @property(cc.Node)
    public content: cc.Node = null; // 内容容器节点

    @property(cc.Prefab)
    private itemPrefab: cc.Prefab = null; // 列表项预制体

    @property({ tooltip: "每个项目的高度（固定高度模式）" })
    private itemHeight: number = 100; // 列表项固定高度

    @property({ tooltip: "每个项目的宽度" })
    private itemWidth: number = 100; // 列表项宽度

    @property({ tooltip: "每行的列数（纵向）或每列的行数（横向）" })
    private columnCount: number = 1; // 多列布局的列数

    @property({ tooltip: "项目之间的垂直间距" })
    private itemSpacing: number = 0; // 行间距

    @property({ tooltip: "项目之间的水平间距" })
    private columnSpacing: number = 0; // 列间距

    @property({ tooltip: "项目上挂载的 Component 名称，例如 'ItemScript'" })
    private itemScriptName: string = "ItemScript"; // 列表项脚本组件名

    @property({ tooltip: "是否启用动态高度（如果启用，需要项目脚本提供 getItemHeight 方法）" })
    private enableDynamicHeight: boolean = false; // 是否支持动态高度

    @property({ tooltip: "开始位置偏移量（纵向为顶部，横向为左侧）" })
    private topPadding: number = 0; // 开始位置内边距

    @property({ tooltip: "结束位置偏移量（纵向为底部，横向为右侧）" })
    private bottomPadding: number = 0; // 结束位置内边距

    // 私有属性
    private preCreatedNodes: cc.Node[] = []; // 预创建的节点池
    private allData: any[] = []; // 所有数据数组
    private activeItemsMap: Map<number, cc.Node> = new Map(); // 当前激活项目的映射表
    private rowHeights: number[] = []; // 每行的高度数组
    private rowPositions: number[] = []; // 每行的Y位置数组（纵向）或X位置数组（横向）
    private viewportHeight: number = 0; // 视口高度
    private viewportWidth: number = 0; // 视口宽度
    private totalHeight: number = 0; // 内容总高度（纵向）
    private totalWidth: number = 0; // 内容总宽度（横向）
    private maxVisibleCount: number = 0; // 最大可见节点数
    private totalRows: number = 0; // 总行数
    private isHorizontal: boolean = false; // 是否为横向模式

    // 位置记录相关属性
    private itemPositionRecords: Map<number, { x: number, y: number, timestamp: number }> = new Map(); // 项目位置记录
    private positionHistory: Array<{ scrollPos: cc.Vec2, visibleItems: number[], timestamp: number }> = []; // 滚动位置历史
    private enablePositionTracking: boolean = false; // 是否启用位置跟踪
    private maxHistoryLength: number = 50; // 最大历史记录长度

    protected onLoad() {
        this.initializeScrollView();
        // 延迟初始化，确保ScrollView尺寸计算正确
        this.scheduleOnce(this.initialize, 0);
    }

    /**
     * 初始化组件
     * 计算视口尺寸、预创建节点、处理初始数据
     */
    private initialize() {
        this.detectScrollDirection();
        this.calculateViewportSize();
        this.calculateMaxVisibleCount();
        this.preCreateNodes();
        
        // 如果已有数据，立即显示
        if (this.allData.length > 0) {
            this.calculateRowPositions();
            this.updateContentSize();
            // 确保初始化时强制更新可见项目
            this.scheduleOnce(() => {
                this.updateVisibleItems();
            }, 0.1);
        }
        
        // 发送初始化完成事件
        this.node.emit("VirtualScrollViewReady");
    }

    /**
     * 检测滚动方向
     */
    private detectScrollDirection() {
        if (this.scrollView) {
            this.isHorizontal = this.scrollView.horizontal && !this.scrollView.vertical;
        }
    }

    /**
     * 初始化ScrollView组件
     * 绑定滚动事件监听
     */
    private initializeScrollView() {
        if (!this.scrollView) {
            console.error("ScrollView 未设置");
            return;
        }
        
        // 绑定滚动事件
        this.scrollView.node.on('scrolling', this.onScrolling, this);
        this.scrollView.node.on('scroll-ended', this.onScrollEnded, this);
    }

    /**
     * 计算视口尺寸
     * 用于确定可见区域大小
     */
    private calculateViewportSize() {
        this.viewportHeight = this.scrollView.node.height;
        this.viewportWidth = this.scrollView.node.width;
        
        // 如果获取不到有效尺寸，使用默认值
        if (this.viewportHeight <= 0) {
            this.viewportHeight = 800;
        }
        if (this.viewportWidth <= 0) {
            this.viewportWidth = 800;
        }
    }

    /**
     * 计算最大可见节点数量
     * 根据视口尺寸、项目尺寸计算需要预创建的节点数
     */
    private calculateMaxVisibleCount() {
        if (this.isHorizontal) {
            // 横向模式：可见列数 = 视口宽度 / 项目宽度 + 1
            const visibleCols = Math.ceil(this.viewportWidth / this.itemWidth) + 1;
            this.maxVisibleCount = visibleCols * this.columnCount;
        } else {
            // 纵向模式：可见行数 = 视口高度 / 项目高度 + 1
            const visibleRows = Math.ceil(this.viewportHeight / this.itemHeight) + 1;
            this.maxVisibleCount = visibleRows * this.columnCount;
        }
    }

    /**
     * 预创建节点池
     * 一次性创建所有需要的节点，避免运行时频繁创建销毁
     */
    private preCreateNodes() {
        if (!this.itemPrefab || !this.content) {
            console.error("itemPrefab 或 content 未设置");
            return;
        }

        // 预创建指定数量的节点
        for (let i = 0; i < this.maxVisibleCount; i++) {
            const node = cc.instantiate(this.itemPrefab);
            node.active = false; // 初始隐藏
            // node.width = this.itemWidth; // 设置宽度
            // node.height = this.itemHeight; // 设置高度
            this.content.addChild(node);
            this.preCreatedNodes.push(node);
        }
    }

    /**
     * 设置数据并刷新显示
     * @param newData 新的数据数组
     */
    public refreshData(newData: any[]) {
        this.allData = newData || [];
        this.hideAllNodes(); // 隐藏所有节点
        this.calculateRowPositions(); // 重新计算位置
        this.updateContentSize(); // 更新内容尺寸
        
        // 如果有数据，立即更新显示
        if (this.allData.length > 0) {
            this.updateVisibleItems();
        }
    }

    /**
     * 更新数据但不重新计算位置
     * 适用于数据内容变化但数量不变的情况
     * @param newData 新的数据数组
     */
    public UpdateData(newData: any[]) {
        if (newData.length !== this.allData.length) {
            // 数据长度变化，使用完整更新
            this.refreshData(newData);
            return;
        }
        
        this.allData = newData;
        // 只更新当前可见项目的数据
        this.activeItemsMap.forEach((node, index) => {
            this.updateItemData(node, this.allData[index], index);
        });
    }

    /**
     * 刷新所有可见项目
     */
    public refresh() {
        this.updateVisibleItems();
    }

    /**
     * 滚动到指定索引的项目
     * @param index 目标数据索引
     * @param duration 滚动动画时长
     */
    public scrollToIndex(index: number, duration: number = 0.3) {
        if (index < 0 || index >= this.allData.length) return;

        // 计算目标行和位置
        const rowIndex = Math.floor(index / this.columnCount);
        
        if (this.isHorizontal) {
            const targetX = this.getRowPosition(rowIndex);
            const scrollX = Math.max(0, Math.min(targetX, this.totalWidth - this.viewportWidth));
            this.scrollView.scrollToOffset(cc.v2(scrollX, 0), duration);
        } else {
            const targetY = this.getRowPosition(rowIndex);
            const scrollY = Math.max(0, Math.min(targetY, this.totalHeight - this.viewportHeight));
            this.scrollView.scrollToOffset(cc.v2(0, scrollY), duration);
        }
    }

    /**
     * 滚动到顶部
     * @param duration 滚动动画时长
     */
    public scrollToTop() {
        if (this.isHorizontal) {
            this.scrollView.scrollToLeft(0);
        } else {
            this.scrollView.scrollToTop(0);
        }
    }

    /**
     * 计算行位置
     * 根据数据量、行高、间距等计算每行的位置和总尺寸
     */
    private calculateRowPositions() {
        this.totalRows = Math.ceil(this.allData.length / this.columnCount);
        this.rowPositions = [];
        this.rowHeights = [];
        
        if (this.isHorizontal) {
            // 横向模式：计算X位置和总宽度
            let currentX = this.topPadding + (this.itemWidth / 2);
            
            for (let rowIndex = 0; rowIndex < this.totalRows; rowIndex++) {
                this.rowPositions[rowIndex] = currentX;
                
                let rowWidth = this.itemWidth;
                if (this.enableDynamicHeight) {
                    rowWidth = this.getDynamicRowWidth(rowIndex);
                }
                
                this.rowHeights[rowIndex] = rowWidth; // 在横向模式下，这里存储的是宽度
                currentX += rowWidth;
                
                if (rowIndex < this.totalRows - 1) {
                    currentX += this.itemSpacing;
                }
            }
            
            this.totalWidth = currentX + this.bottomPadding + (this.itemWidth / 2) - this.itemWidth;
        } else {
            // 纵向模式：计算Y位置和总高度
            let currentY = this.topPadding + (this.itemHeight / 2);
            
            for (let rowIndex = 0; rowIndex < this.totalRows; rowIndex++) {
                this.rowPositions[rowIndex] = currentY;
                
                let rowHeight = this.itemHeight;
                if (this.enableDynamicHeight) {
                    rowHeight = this.getDynamicRowHeight(rowIndex);
                }
                
                this.rowHeights[rowIndex] = rowHeight;
                currentY += rowHeight;
                
                if (rowIndex < this.totalRows - 1) {
                    currentY += this.itemSpacing;
                }
            }
            
            this.totalHeight = currentY + this.bottomPadding + (this.itemHeight / 2) - this.itemHeight;
        }
    }

    /**
     * 获取动态行高度（纵向模式）
     * @param rowIndex 行索引
     * @returns 该行的高度
     */
    private getDynamicRowHeight(rowIndex: number): number {
        let maxHeight = this.itemHeight;
        
        for (let col = 0; col < this.columnCount; col++) {
            const dataIndex = rowIndex * this.columnCount + col;
            if (dataIndex < this.allData.length) {
                const data = this.allData[dataIndex];
                if (data && typeof data.height === 'number') {
                    maxHeight = Math.max(maxHeight, data.height);
                }
            }
        }
        
        return maxHeight;
    }

    /**
     * 获取动态行宽度（横向模式）
     * @param rowIndex 行索引
     * @returns 该行的宽度
     */
    private getDynamicRowWidth(rowIndex: number): number {
        let maxWidth = this.itemWidth;
        
        for (let col = 0; col < this.columnCount; col++) {
            const dataIndex = rowIndex * this.columnCount + col;
            if (dataIndex < this.allData.length) {
                const data = this.allData[dataIndex];
                if (data && typeof data.width === 'number') {
                    maxWidth = Math.max(maxWidth, data.width);
                }
            }
        }
        
        return maxWidth;
    }

    /**
     * 更新内容容器尺寸
     */
    private updateContentSize() {
        if (this.content) {
            if (this.isHorizontal) {
                // 横向模式：设置宽度为计算出的总宽度
                this.content.width = this.totalWidth;
                
                // 横向模式下的content高度：根据columnCount和item高度计算
                // 这里的columnCount在横向模式下表示垂直方向上的行数
                const totalItemHeight = this.itemHeight * this.columnCount;
                const totalVerticalSpacing = this.columnSpacing * Math.max(0, this.columnCount - 1);
                this.content.height = totalItemHeight + totalVerticalSpacing;
            } else {
                // 纵向模式：设置高度为计算出的总高度
                this.content.height = this.totalHeight;
                
                // 纵向模式下的content宽度：根据columnCount和item宽度计算
                // 这里的columnCount在纵向模式下表示水平方向上的列数
                const totalItemWidth = this.itemWidth * this.columnCount;
                const totalHorizontalSpacing = this.columnSpacing * Math.max(0, this.columnCount - 1);
                this.content.width = totalItemWidth + totalHorizontalSpacing;
            }
        }
    }

    /**
     * 获取指定行的位置
     * @param rowIndex 行索引
     * @returns 位置值（横向为X，纵向为Y）
     */
    private getRowPosition(rowIndex: number): number {
        return this.rowPositions[rowIndex] || 0;
    }

    /**
     * 获取指定行的尺寸
     * @param rowIndex 行索引
     * @returns 尺寸值（横向为宽度，纵向为高度）
     */
    private getRowHeight(rowIndex: number): number {
        return this.rowHeights[rowIndex] || (this.isHorizontal ? this.itemWidth : this.itemHeight);
    }

    /**
     * 滚动中事件处理
     */
    private onScrolling() {
        this.updateVisibleItems();
        
        // 记录滚动位置历史（如果启用了位置跟踪）
        if (this.enablePositionTracking) {
            this.recordScrollPosition();
        }
    }

    /**
     * 滚动结束事件处理
     */
    private onScrollEnded() {
        this.updateVisibleItems();
        
        // 记录滚动位置历史（如果启用了位置跟踪）
        if (this.enablePositionTracking) {
            this.recordScrollPosition();
        }
    }

    /**
     * 记录项目位置
     * @param dataIndex 数据索引
     * @param x X坐标
     * @param y Y坐标
     */
    private recordItemPosition(dataIndex: number, x: number, y: number) {
        this.itemPositionRecords.set(dataIndex, {
            x: x,
            y: y,
            timestamp: Date.now()
        });
    }

    /**
     * 记录滚动位置和可见项目
     */
    private recordScrollPosition() {
        const scrollPos = this.scrollView.getScrollOffset();
        const visibleItems = Array.from(this.activeItemsMap.keys()).sort((a, b) => a - b);
        
        // 检查可见项目是否发生变化
        const lastRecord = this.positionHistory[this.positionHistory.length - 1];
        const visibleItemsChanged = !lastRecord || 
            visibleItems.length !== lastRecord.visibleItems.length ||
            !visibleItems.every((item, index) => item === lastRecord.visibleItems[index]);
        
        const record = {
            scrollPos: cc.v2(scrollPos.x, scrollPos.y),
            visibleItems: visibleItems.slice(), // 复制数组
            timestamp: Date.now()
        };
        
        this.positionHistory.push(record);
        
        // 限制历史记录长度
        if (this.positionHistory.length > this.maxHistoryLength) {
            this.positionHistory.shift();
        }
        
        // 只在可见项目发生变化时输出调试信息
        if (visibleItemsChanged && visibleItems.length > 0) {
            const itemRangeStr = visibleItems.length > 0 ? 
                `[${visibleItems[0]}-${visibleItems[visibleItems.length - 1]}]` : '[]';
            console.log(`[位置跟踪] 滚动位置: (${scrollPos.x.toFixed(1)}, ${scrollPos.y.toFixed(1)}), 可见项目: ${itemRangeStr} (共${visibleItems.length}个)`);
        }
    }

    /**
     * 更新可见项目
     * 核心方法：根据滚动位置显示/隐藏项目
     */
    private updateVisibleItems() {
        if (!this.content || this.allData.length === 0) return;

        // 获取当前滚动位置和可见行范围
        const scrollPosition = this.scrollView.getScrollOffset();
        const visibleRowRange = this.getVisibleRowRange(this.isHorizontal ? scrollPosition.x : scrollPosition.y);
        
        // 隐藏不在可见范围内的项目
        this.activeItemsMap.forEach((node, dataIndex) => {
            const rowIndex = Math.floor(dataIndex / this.columnCount);
            if (rowIndex < visibleRowRange.start || rowIndex > visibleRowRange.end) {
                node.active = false;
                node.off("ItemEvent", this.onItemEvent, this);
                this.activeItemsMap.delete(dataIndex);
            }
        });

        // 显示可见范围内的项目
        for (let rowIndex = visibleRowRange.start; rowIndex <= visibleRowRange.end; rowIndex++) {
            for (let colIndex = 0; colIndex < this.columnCount; colIndex++) {
                const dataIndex = rowIndex * this.columnCount + colIndex;
                
                // 检查数据是否存在
                if (dataIndex >= this.allData.length) break;
                
                // 如果项目尚未激活，分配节点并设置
                if (!this.activeItemsMap.has(dataIndex)) {
                    const availableNode = this.getAvailableNode();
                    if (availableNode) {
                        this.setupItem(availableNode, dataIndex, rowIndex, colIndex);
                        this.activeItemsMap.set(dataIndex, availableNode);
                    } else {
                        return; // 没有可用节点，停止处理
                    }
                }
            }
        }
    }

    /**
     * 获取可见行范围
     * 根据滚动位置计算哪些行应该显示
     * @param scrollPos 当前滚动位置（横向为X，纵向为Y）
     * @returns 可见行的起始和结束索引
     */
    private getVisibleRowRange(scrollPos: number): { start: number; end: number } {
        if (this.totalRows === 0) {
            return { start: 0, end: 0 };
        }
        
        const viewportSize = this.isHorizontal ? this.viewportWidth : this.viewportHeight;
        const itemSize = this.isHorizontal ? this.itemWidth : this.itemHeight;
        
        let adjustedScrollPos = scrollPos;
        
        // 修复横向模式的滚动位置计算
        if (this.isHorizontal) {
            // 在横向模式下，ScrollView的滚动偏移量是负数表示向右滚动
            // 我们需要将其转换为正数来匹配我们的行位置计算
            adjustedScrollPos = Math.abs(scrollPos);
            
            console.log(`[调试] 原始滚动位置: ${scrollPos.toFixed(1)}, 调整后: ${adjustedScrollPos.toFixed(1)}`);
        }
        
        // 计算可见区域的起始和结束行
        // 扩大可见范围以确保边界项目显示
        const bufferSize = itemSize;
        const startRow = Math.max(0, this.findRowIndexByPosition(Math.max(0, adjustedScrollPos - bufferSize)));
        const endRow = Math.min(this.totalRows - 1, this.findRowIndexByPosition(adjustedScrollPos + viewportSize + bufferSize));
        
        // 确保至少显示第一行（解决初始状态不显示的问题）
        if (adjustedScrollPos <= bufferSize && startRow > 0) {
            return { start: 0, end: Math.max(0, endRow) };
        }
        
        // console.log(`[调试] 滚动位置: ${adjustedScrollPos.toFixed(1)}, 视口: ${viewportSize}, 可见行: ${startRow}-${endRow}`);
        
        return { start: startRow, end: endRow };
    }

    /**
     * 根据位置查找对应的行索引
     * 使用二分查找提高性能
     * @param pos 位置值（横向为X，纵向为Y）
     * @returns 行索引
     */
    private findRowIndexByPosition(pos: number): number {
        if (this.rowPositions.length === 0) {
            return 0;
        }
        
        // 简化的线性查找，更稳定
        for (let i = 0; i < this.rowPositions.length; i++) {
            const rowPos = this.rowPositions[i];
            const rowSize = this.getRowHeight(i);
            const rowStart = rowPos - (rowSize / 2);
            const rowEnd = rowPos + (rowSize / 2);
            
            if (pos >= rowStart && pos <= rowEnd) {
                return i;
            }
        }
        
        // 如果没有找到精确匹配，返回最接近的行
        if (pos < this.rowPositions[0] - this.getRowHeight(0) / 2) {
            return 0;
        }
        
        const lastIndex = this.rowPositions.length - 1;
        if (pos > this.rowPositions[lastIndex] + this.getRowHeight(lastIndex) / 2) {
            return lastIndex;
        }
        
        // 使用二分查找作为后备方案
        let left = 0;
        let right = this.rowPositions.length - 1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const rowPos = this.rowPositions[mid];
            
            if (pos < rowPos) {
                right = mid - 1;
            } else if (pos > rowPos) {
                left = mid + 1;
            } else {
                return mid;
            }
        }
        
        return Math.max(0, Math.min(left, this.rowPositions.length - 1));
    }

    /**
     * 获取可用的空闲节点
     * @returns 可用节点或null
     */
    private getAvailableNode(): cc.Node | null {
        // 从预创建节点中找到未激活的节点
        for (let node of this.preCreatedNodes) {
            if (!node.active) {
                return node;
            }
        }
        return null;
    }

    /**
     * 设置项目节点
     * 配置节点的位置、尺寸、数据和事件
     * @param node 节点对象
     * @param dataIndex 数据索引
     * @param rowIndex 行索引
     * @param colIndex 列索引
     */
    private setupItem(node: cc.Node, dataIndex: number, rowIndex: number, colIndex: number) {
        if (!this.content) return;

        // 计算并设置位置
        if (this.isHorizontal) {
            const x = this.calculateItemX_Horizontal(rowIndex);
            const y = this.calculateItemY_Horizontal(colIndex);
            node.setPosition(x, y);
            
            // 设置尺寸
            // node.width = this.getRowHeight(rowIndex); // 在横向模式下，rowHeight存储的是宽度
            // node.height = this.itemHeight;
        } else {
            const y = this.calculateItemY_Vertical(rowIndex);
            const x = this.calculateItemX_Vertical(colIndex);
            node.setPosition(x, y);
            
            // 设置尺寸
            // node.height = this.getRowHeight(rowIndex);
            // node.width = this.itemWidth;
        }
        
        // 激活节点
        node.active = true;

        // 记录项目位置（如果启用了位置跟踪）
        if (this.enablePositionTracking) {
            this.recordItemPosition(dataIndex, node.x, node.y);
        }

        // 设置数据
        this.updateItemData(node, this.allData[dataIndex], dataIndex);
        
        // 绑定事件
        node.on("ItemEvent", this.onItemEvent, this);
    }

    /**
     * 计算项目的Y坐标（纵向模式）
     * @param rowIndex 行索引
     * @returns Y坐标
     */
    private calculateItemY_Vertical(rowIndex: number): number {
        const rowY = this.getRowPosition(rowIndex);
        const contentAnchorY = this.content.anchorY;
        
        // 根据content的Y锚点调整坐标系
        if (contentAnchorY === 1) {
            // 锚点在顶部：Y轴向下为正，使用负值
            return -rowY;
        } else if (contentAnchorY === 0.5) {
            // 锚点在中心：以中心为原点
            return (this.totalHeight / 2) - rowY;
        } else if (contentAnchorY === 0) {
            // 锚点在底部：Y轴向上为正
            return this.totalHeight - rowY;
        } else {
            // 自定义锚点
            return (this.totalHeight * (1 - contentAnchorY)) - rowY;
        }
    }

    /**
     * 计算项目的X坐标（纵向模式）
     * @param colIndex 列索引
     * @returns X坐标
     */
    private calculateItemX_Vertical(colIndex: number): number {
        const contentAnchorX = this.content.anchorX;
        const contentWidth = this.content.width;
        
        // 计算总布局宽度
        const totalItemWidth = this.itemWidth * this.columnCount;
        const totalSpacing = this.columnSpacing * (this.columnCount - 1);
        const totalWidth = totalItemWidth + totalSpacing;
        
        let startX: number;
        
        // 根据content的X锚点调整起始位置
        if (contentAnchorX === 0) {
            // 左对齐
            startX = this.itemWidth / 2;
        } else if (contentAnchorX === 0.5) {
            // 居中对齐
            startX = -totalWidth / 2 + this.itemWidth / 2;
        } else if (contentAnchorX === 1) {
            // 右对齐
            startX = -totalWidth + this.itemWidth / 2;
        } else {
            // 自定义锚点
            const offset = contentWidth * (contentAnchorX - 0.5);
            startX = offset - totalWidth / 2 + this.itemWidth / 2;
        }
        
        // 计算当前列的X位置
        return startX + colIndex * (this.itemWidth + this.columnSpacing);
    }

    /**
     * 计算项目的X坐标（横向模式）
     * @param rowIndex 行索引
     * @returns X坐标
     */
    private calculateItemX_Horizontal(rowIndex: number): number {
        const rowX = this.getRowPosition(rowIndex);
        const contentAnchorX = this.content.anchorX;
        
        // 横向模式下，直接使用计算出的X位置
        // 因为rowX已经是相对于content左侧的正确位置
        if (contentAnchorX === 0) {
            // 锚点在左侧：直接使用rowX
            return rowX;
        } else if (contentAnchorX === 0.5) {
            // 锚点在中心：需要调整为相对于中心的位置
            return rowX - (this.totalWidth / 2);
        } else if (contentAnchorX === 1) {
            // 锚点在右侧：需要调整为相对于右侧的位置
            return rowX - this.totalWidth;
        } else {
            // 自定义锚点
            return rowX - (this.totalWidth * contentAnchorX);
        }
    }

    /**
     * 计算项目的Y坐标（横向模式）
     * @param colIndex 列索引
     * @returns Y坐标
     */
    private calculateItemY_Horizontal(colIndex: number): number {
        const contentAnchorY = this.content.anchorY;
        
        // 计算总布局高度
        const totalItemHeight = this.itemHeight * this.columnCount;
        const totalSpacing = this.columnSpacing * Math.max(0, this.columnCount - 1);
        const totalLayoutHeight = totalItemHeight + totalSpacing;
        
        let startY: number;
        
        // 根据content的Y锚点调整起始位置
        if (contentAnchorY === 1) {
            // 锚点在顶部：从顶部开始向下排列
            startY = -this.itemHeight / 2;
        } else if (contentAnchorY === 0.5) {
            // 锚点在中心：居中排列
            startY = (totalLayoutHeight / 2) - (this.itemHeight / 2);
        } else if (contentAnchorY === 0) {
            // 锚点在底部：从底部开始向上排列
            startY = totalLayoutHeight - (this.itemHeight / 2);
        } else {
            // 自定义锚点
            const anchorOffset = totalLayoutHeight * (1 - contentAnchorY);
            startY = anchorOffset - (this.itemHeight / 2);
        }
        
        // 计算当前列的Y位置（向下排列）
        return startY - colIndex * (this.itemHeight + this.columnSpacing);
    }

    /**
     * 更新项目数据
     * 调用项目脚本的setData方法
     * @param node 节点对象
     * @param data 数据对象
     * @param index 数据索引
     */
    private updateItemData(node: cc.Node, data: any, index: number) {
        const comp = node.getComponent(this.itemScriptName);
        if (comp && typeof comp.setData === "function") {
            comp.setData(data, index);
        }
    }

    /**
     * 隐藏所有节点
     * 清空激活映射表
     */
    private hideAllNodes() {
        this.preCreatedNodes.forEach(node => {
            node.active = false;
            node.off("ItemEvent", this.onItemEvent, this);
        });
        this.activeItemsMap.clear();
    }

    /**
     * 项目事件处理
     * 转发项目发出的事件
     * @param data 事件数据
     */
    private onItemEvent(data: any) {
        this.node.emit("ScrollItemEvent", data);
    }

    // ========== 公共API方法 ==========

    /** 获取当前数据长度 */
    public getDataLength(): number {
        return this.allData.length;
    }

    /** 获取指定索引的数据 */
    public getDataAtIndex(index: number): any {
        return this.allData[index];
    }

    /** 
     * 插入数据
     * @param index 插入位置
     * @param data 数据对象
     */
    public insertData(index: number, data: any) {
        if (index < 0 || index > this.allData.length) return;
        
        this.allData.splice(index, 0, data);
        this.calculateRowPositions();
        this.updateContentSize();
        this.updateVisibleItems();
    }

    /** 
     * 删除数据
     * @param index 删除位置
     */
    public removeData(index: number) {
        if (index < 0 || index >= this.allData.length) return;
        
        this.allData.splice(index, 1);
        this.calculateRowPositions();
        this.updateContentSize();
        this.updateVisibleItems();
    }

    // ========== 位置跟踪API方法 ==========

    /** 
     * 启用位置跟踪
     * @param enable 是否启用
     */
    public setPositionTracking(enable: boolean) {
        this.enablePositionTracking = enable;
        if (enable) {
            console.log("[位置跟踪] 已启用位置跟踪功能");
            // 立即记录当前状态
            this.recordScrollPosition();
        } else {
            console.log("[位置跟踪] 已禁用位置跟踪功能");
        }
    }

    /** 
     * 获取当前所有显示项目的位置记录
     * @returns 位置记录映射表
     */
    public getItemPositionRecords(): Map<number, { x: number, y: number, timestamp: number }> {
        return new Map(this.itemPositionRecords);
    }

    /** 
     * 获取指定项目的位置记录
     * @param dataIndex 数据索引
     * @returns 位置记录或null
     */
    public getItemPositionAt(dataIndex: number): { x: number, y: number, timestamp: number } | null {
        return this.itemPositionRecords.get(dataIndex) || null;
    }

    /** 
     * 获取滚动位置历史记录
     * @param count 获取的记录数量，默认为全部
     * @returns 历史记录数组
     */
    public getPositionHistory(count?: number): Array<{ scrollPos: cc.Vec2, visibleItems: number[], timestamp: number }> {
        if (count && count > 0) {
            return this.positionHistory.slice(-count);
        }
        return this.positionHistory.slice();
    }

    /** 
     * 清空位置记录
     */
    public clearPositionRecords() {
        this.itemPositionRecords.clear();
        this.positionHistory = [];
        console.log("[位置跟踪] 已清空所有位置记录");
    }

    /** 
     * 打印当前位置跟踪信息
     */
    public printPositionTrackingInfo() {
        console.log("=== 位置跟踪信息 ===");
        console.log(`跟踪状态: ${this.enablePositionTracking ? '启用' : '禁用'}`);
        console.log(`项目位置记录数: ${this.itemPositionRecords.size}`);
        console.log(`历史记录数: ${this.positionHistory.length}`);
        
        if (this.itemPositionRecords.size > 0) {
            console.log("当前显示项目位置:");
            this.itemPositionRecords.forEach((record, index) => {
                const timeStr = new Date(record.timestamp).toLocaleTimeString();
                console.log(`  项目 ${index}: (${record.x.toFixed(1)}, ${record.y.toFixed(1)}) - ${timeStr}`);
            });
        }
        
        if (this.positionHistory.length > 0) {
            const latest = this.positionHistory[this.positionHistory.length - 1];
            const timeStr = new Date(latest.timestamp).toLocaleTimeString();
            console.log(`最新滚动位置: (${latest.scrollPos.x.toFixed(1)}, ${latest.scrollPos.y.toFixed(1)}) - ${timeStr}`);
            console.log(`当前可见项目: [${latest.visibleItems.join(', ')}]`);
        }
        console.log("==================");
    }

    // ========== 调试和信息获取方法 ==========

    /** 调试：打印当前状态信息 */
    public debugPrint() {
        const scrollPos = this.scrollView.getScrollOffset();
        const visibleRange = this.getVisibleRowRange(this.isHorizontal ? scrollPos.x : scrollPos.y);
        
        console.log("=== VirtualScrollView Debug Info ===");
        console.log("模式:", this.isHorizontal ? "横向" : "纵向");
        console.log("数据长度:", this.allData.length);
        console.log("总行数:", this.totalRows);
        console.log("视口尺寸:", `${this.viewportWidth} x ${this.viewportHeight}`);
        console.log("Content尺寸:", `${this.content?.width} x ${this.content?.height}`);
        console.log("总尺寸:", this.isHorizontal ? `width: ${this.totalWidth}` : `height: ${this.totalHeight}`);
        console.log("滚动位置:", `x: ${scrollPos.x}, y: ${scrollPos.y}`);
        console.log("可见行范围:", `${visibleRange.start} - ${visibleRange.end}`);
        console.log("激活节点数:", this.activeItemsMap.size);
        console.log("预创建节点数:", this.preCreatedNodes.length);
        
        // 横向模式的详细调试信息
        if (this.isHorizontal) {
            console.log("--- 横向模式详细信息 ---");
            console.log("列数(columnCount):", this.columnCount);
            console.log("项目宽度:", this.itemWidth);
            console.log("项目高度:", this.itemHeight);
            console.log("项目间距:", this.itemSpacing);
            console.log("列间距:", this.columnSpacing);
            console.log("左侧偏移:", this.topPadding);
            console.log("右侧偏移:", this.bottomPadding);
            
            // 打印可见行范围内的位置信息
            console.log("可见行位置信息:");
            for (let i = Math.max(0, visibleRange.start - 1); i <= Math.min(this.totalRows - 1, visibleRange.end + 1); i++) {
                const rowPos = this.getRowPosition(i);
                const rowSize = this.getRowHeight(i);
                const isVisible = i >= visibleRange.start && i <= visibleRange.end;
                console.log(`  行${i}: 位置=${rowPos.toFixed(1)}, 尺寸=${rowSize.toFixed(1)}, 范围=[${(rowPos - rowSize/2).toFixed(1)}, ${(rowPos + rowSize/2).toFixed(1)}] ${isVisible ? '(可见)' : ''}`);
            }
            
            // 测试滚动位置对应的行索引
            const testPositions = [scrollPos.x, scrollPos.x + this.viewportWidth/2, scrollPos.x + this.viewportWidth];
            console.log("滚动位置测试:");
            testPositions.forEach(pos => {
                const rowIndex = this.findRowIndexByPosition(pos);
                console.log(`  位置${pos.toFixed(1)} -> 行${rowIndex}`);
            });
        }
        
        if (this.totalRows > 0) {
            console.log("第一行位置:", this.getRowPosition(0));
            console.log("第一行尺寸:", this.getRowHeight(0));
        }
        
        // 打印前几个项目的位置信息
        console.log("前几个项目位置:");
        for (let i = 0; i < Math.min(5, this.allData.length); i++) {
            const rowIndex = Math.floor(i / this.columnCount);
            const colIndex = i % this.columnCount;
            let x: number, y: number;
            
            if (this.isHorizontal) {
                x = this.calculateItemX_Horizontal(rowIndex);
                y = this.calculateItemY_Horizontal(colIndex);
            } else {
                x = this.calculateItemX_Vertical(colIndex);
                y = this.calculateItemY_Vertical(rowIndex);
            }
            
            const isActive = this.activeItemsMap.has(i);
            console.log(`  项目 ${i} (row:${rowIndex}, col:${colIndex}) 位置: (${x.toFixed(1)}, ${y.toFixed(1)}) ${isActive ? '(激活)' : ''}`);
        }
        
        // 打印当前激活的项目
        if (this.activeItemsMap.size > 0) {
            const activeIndices = Array.from(this.activeItemsMap.keys()).sort((a, b) => a - b);
            console.log("当前激活项目:", activeIndices.join(', '));
        }
        
        console.log("================================");
    }

    /** 强制显示所有数据项（调试用） */
    public debugShowAll() {
        if (!this.content || this.allData.length === 0) return;
        
        // 隐藏所有现有节点
        this.hideAllNodes();
        
        // 显示前几个项目用于调试
        const showCount = Math.min(this.allData.length, this.preCreatedNodes.length);
        
        for (let dataIndex = 0; dataIndex < showCount; dataIndex++) {
            const rowIndex = Math.floor(dataIndex / this.columnCount);
            const colIndex = dataIndex % this.columnCount;
            
            const node = this.preCreatedNodes[dataIndex];
            if (node) {
                this.setupItem(node, dataIndex, rowIndex, colIndex);
                this.activeItemsMap.set(dataIndex, node);
                console.log(`显示项目 ${dataIndex} 在位置 (${node.x}, ${node.y})`);
            }
        }
    }

    /** 获取当前激活的节点数量（用于调试） */
    public getActiveNodeCount(): number {
        return this.activeItemsMap.size;
    }

    /** 获取预创建的节点总数（用于调试） */
    public getPreCreatedNodeCount(): number {
        return this.preCreatedNodes.length;
    }

    /** 获取总行数（用于调试） */
    public getTotalRows(): number {
        return this.totalRows;
    }

    /** 根据数据索引获取行列信息（用于调试） */
    public getRowColByIndex(dataIndex: number): { row: number, col: number } {
        return {
            row: Math.floor(dataIndex / this.columnCount),
            col: dataIndex % this.columnCount
        };
    }

    /** 获取Content的锚点和布局信息（用于调试） */
    public getLayoutInfo(): { 
        anchorX: number, 
        anchorY: number, 
        contentWidth: number, 
        contentHeight: number,
        totalHeight: number,
        totalWidth: number,
        totalRows: number,
        startPadding: number,
        endPadding: number,
        isHorizontal: boolean
    } {
        return {
            anchorX: this.content ? this.content.anchorX : 0,
            anchorY: this.content ? this.content.anchorY : 0,
            contentWidth: this.content ? this.content.width : 0,
            contentHeight: this.content ? this.content.height : 0,
            totalHeight: this.totalHeight,
            totalWidth: this.totalWidth,
            totalRows: this.totalRows,
            startPadding: this.topPadding, // 纵向模式：顶部间距，横向模式：左侧间距
            endPadding: this.bottomPadding, // 纵向模式：底部间距，横向模式：右侧间距
            isHorizontal: this.isHorizontal
        };
    }

    /** 获取ScrollView的配置信息（用于调试） */
    public getScrollViewInfo(): {
        vertical: boolean,
        horizontal: boolean,
        nodeWidth: number,
        nodeHeight: number,
        contentWidth: number,
        contentHeight: number
    } {
        return {
            vertical: this.scrollView ? this.scrollView.vertical : false,
            horizontal: this.scrollView ? this.scrollView.horizontal : false,
            nodeWidth: this.scrollView ? this.scrollView.node.width : 0,
            nodeHeight: this.scrollView ? this.scrollView.node.height : 0,
            contentWidth: this.content ? this.content.width : 0,
            contentHeight: this.content ? this.content.height : 0
        };
    }

    protected onDestroy() {
        // 清理事件监听
        if (this.scrollView && this.scrollView.node) {
            this.scrollView.node.off('scrolling', this.onScrolling, this);
            this.scrollView.node.off('scroll-ended', this.onScrollEnded, this);
        }
        
        this.hideAllNodes();
    }
} 
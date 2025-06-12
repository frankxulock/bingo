import VirtualScrollView from './VirtualScrollView';

const { ccclass, property } = cc._decorator;

/**
 * VirtualScrollView 使用示例
 * 展示如何使用虚拟滚动列表组件（支持多列布局）
 */
@ccclass
export default class VirtualScrollViewExample extends cc.Component {
    @property(VirtualScrollView)
    private virtualScrollView: VirtualScrollView = null;

    @property({ tooltip: "测试数据数量" })
    private testDataCount: number = 1000;

    protected onLoad() {
        // 生成测试数据
        const testData = this.generateTestData(this.testDataCount);
        
        // 设置数据到虚拟滚动列表
        this.virtualScrollView.refreshData(testData);
        
        // 监听项目事件
        this.node.on("VirtualScrollItemEvent", this.onItemEvent, this);
        
        // 监听虚拟滚动列表初始化完成事件
        this.virtualScrollView.node.on("VirtualScrollViewReady", this.onVirtualScrollViewReady, this);
    }

    protected start() {
        // 备用方案：如果事件没有触发，延迟打印调试信息
        this.scheduleOnce(() => {
            if (this.virtualScrollView.getPreCreatedNodeCount() === 0) {
                this.printDebugInfo();
            }
        }, 0.2);
    }

    private generateTestData(count: number): any[] {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push({
                id: i,
                title: `项目 ${i}`,
                description: `这是第 ${i} 个项目的描述`,
                value: Math.floor(Math.random() * 1000),
                // 如果启用动态高度，可以设置不同的高度
                height: 80 + Math.floor(Math.random() * 40) // 80-120之间的随机高度
            });
        }
        return data;
    }

    private onItemEvent(eventData: any) {
        console.log("收到项目事件:", eventData);
        
        // 这里可以处理项目的点击事件等
        if (eventData.type === "click") {
            console.log(`点击了项目: ${eventData.data.title}`);
            
            // 获取项目的行列信息
            const rowCol = this.virtualScrollView.getRowColByIndex(eventData.index);
            console.log(`项目位置: 第${rowCol.row + 1}行，第${rowCol.col + 1}列`);
        }
    }

    private onVirtualScrollViewReady() {
        // 在VirtualScrollView初始化完成后打印调试信息
        this.printDebugInfo();
    }

    private printDebugInfo() {
        console.log("=== 虚拟滚动列表调试信息 ===");
        console.log(`数据总数: ${this.virtualScrollView.getDataLength()}`);
        console.log(`总行数: ${this.virtualScrollView.getTotalRows()}`);
        console.log(`预创建节点数: ${this.virtualScrollView.getPreCreatedNodeCount()}`);
        console.log(`当前激活节点数: ${this.virtualScrollView.getActiveNodeCount()}`);
        
        // 添加布局信息
        const layoutInfo = this.virtualScrollView.getLayoutInfo();
        console.log(`Content锚点: (${layoutInfo.anchorX}, ${layoutInfo.anchorY})`);
        console.log(`Content尺寸: ${layoutInfo.contentWidth}x${layoutInfo.contentHeight}`);
        
        // 根据滚动模式显示不同的信息
        if (layoutInfo.isHorizontal) {
            console.log(`总内容宽度: ${layoutInfo.totalWidth}`);
            console.log(`偏移设置: 左侧=${layoutInfo.startPadding}, 右侧=${layoutInfo.endPadding}`);
        } else {
            console.log(`总内容高度: ${layoutInfo.totalHeight}`);
            console.log(`偏移设置: 顶部=${layoutInfo.startPadding}, 底部=${layoutInfo.endPadding}`);
        }
        
        console.log(`滚动模式: ${layoutInfo.isHorizontal ? '横向' : '纵向'}`);
    }

    /** 滚动到顶部示例 */
    public scrollToTop() {
        this.virtualScrollView.scrollToTop();
    }

    /** 滚动到指定项目示例 */
    public scrollToItem(index: number) {
        this.virtualScrollView.scrollToIndex(index);
        const rowCol = this.virtualScrollView.getRowColByIndex(index);
        console.log(`滚动到项目 ${index}（第${rowCol.row + 1}行，第${rowCol.col + 1}列）`);
    }

    /** 添加新项目示例 */
    public addItem() {
        const newData = {
            id: this.testDataCount,
            title: `新项目 ${this.testDataCount}`,
            description: `这是新添加的第 ${this.testDataCount} 个项目`,
            value: Math.floor(Math.random() * 1000)
        };
        
        this.virtualScrollView.insertData(0, newData); // 插入到开头
        this.testDataCount++;
        
        // 更新调试信息
        this.printDebugInfo();
    }

    /** 删除项目示例 */
    public removeItem(index: number) {
        this.virtualScrollView.removeData(index);
        console.log(`删除了项目 ${index}`);
        
        // 更新调试信息
        this.printDebugInfo();
    }

    /** 更新数据示例 */
    public updateData() {
        const newData = this.generateTestData(this.testDataCount);
        this.virtualScrollView.refreshData(newData);
        console.log("数据已更新");
        
        // 更新调试信息
        this.printDebugInfo();
    }

    /** 批量添加数据示例 */
    public addBatchData(count: number = 100) {
        for (let i = 0; i < count; i++) {
            const newData = {
                id: this.testDataCount + i,
                title: `批量项目 ${this.testDataCount + i}`,
                description: `批量添加的第 ${i + 1} 个项目`,
                value: Math.floor(Math.random() * 1000)
            };
            this.virtualScrollView.insertData(this.virtualScrollView.getDataLength(), newData);
        }
        
        this.testDataCount += count;
        console.log(`批量添加了 ${count} 个项目`);
        
        // 更新调试信息
        this.printDebugInfo();
    }

    /** 滚动到中间位置示例 */
    public scrollToMiddle() {
        const middleIndex = Math.floor(this.virtualScrollView.getDataLength() / 2);
        this.scrollToItem(middleIndex);
    }

    /** 随机滚动示例 */
    public scrollToRandom() {
        const randomIndex = Math.floor(Math.random() * this.virtualScrollView.getDataLength());
        this.scrollToItem(randomIndex);
    }

    /** 检查当前状态（用于调试） */
    public checkCurrentState() {
        console.log("=== 当前状态检查 ===");
        console.log(`VirtualScrollView节点尺寸: ${this.virtualScrollView.node.width}x${this.virtualScrollView.node.height}`);
        
        // 获取ScrollView信息
        const scrollViewInfo = this.virtualScrollView.getScrollViewInfo();
        console.log(`ScrollView节点尺寸: ${scrollViewInfo.nodeWidth}x${scrollViewInfo.nodeHeight}`);
        console.log(`ScrollView Vertical: ${scrollViewInfo.vertical}`);
        console.log(`Content节点尺寸: ${scrollViewInfo.contentWidth}x${scrollViewInfo.contentHeight}`);
        
        // 获取Content节点的详细信息
        const content = this.virtualScrollView.content;
        if (content) {
            console.log(`Content锚点: (${content.anchorX}, ${content.anchorY})`);
            console.log(`Content位置: (${content.x}, ${content.y})`);
        }
        
        // 获取布局信息
        const layoutInfo = this.virtualScrollView.getLayoutInfo();
        console.log(`计算的总高度: ${layoutInfo.totalHeight}`);
        
        this.printDebugInfo();
    }

    /** 测试少量数据的计算（用于调试） */
    public testSmallData() {
        console.log("=== 测试少量数据 ===");
        
        // 生成2个测试数据
        const testData = [
            { id: 0, title: "项目 0" },
            { id: 1, title: "项目 1" }
        ];
        
        console.log(`设置${testData.length}个测试数据`);
        this.virtualScrollView.refreshData(testData);
        
        // 延迟检查结果
        this.scheduleOnce(() => {
            this.checkCurrentState();
        }, 0.1);
    }

    /** 测试调试模式（显示所有项目） */
    public testDebugMode() {
        console.log("=== 测试调试模式 ===");
        this.virtualScrollView.debugPrint();
        this.virtualScrollView.debugShowAll();
    }

    /** 测试横向模式配置 */
    public testHorizontalMode() {
        console.log("=== 横向模式测试提示 ===");
        console.log("请确保在编辑器中进行以下设置:");
        console.log("1. ScrollView组件: horizontal=true, vertical=false");
        console.log("2. Content节点: 锚点建议设置为(0, 0.5)");
        console.log("3. VirtualScrollView组件: columnCount表示垂直方向的行数");
        
        const layoutInfo = this.virtualScrollView.getLayoutInfo();
        if (layoutInfo.isHorizontal) {
            console.log("✓ 当前已是横向模式");
        } else {
            console.log("⚠ 当前是纵向模式，需要修改ScrollView设置");
        }
        
        this.printDebugInfo();
    }

    /** 测试纵向模式配置 */
    public testVerticalMode() {
        console.log("=== 纵向模式测试提示 ===");
        console.log("请确保在编辑器中进行以下设置:");
        console.log("1. ScrollView组件: horizontal=false, vertical=true");
        console.log("2. Content节点: 锚点建议设置为(0.5, 1)");
        console.log("3. VirtualScrollView组件: columnCount表示水平方向的列数");
        
        const layoutInfo = this.virtualScrollView.getLayoutInfo();
        if (!layoutInfo.isHorizontal) {
            console.log("✓ 当前已是纵向模式");
        } else {
            console.log("⚠ 当前是横向模式，需要修改ScrollView设置");
        }
        
        this.printDebugInfo();
    }

    /** 测试位置计算 */
    public testPositionCalculation() {
        console.log("=== 位置计算测试 ===");
        
        const dataLength = this.virtualScrollView.getDataLength();
        const testIndices = [0, Math.floor(dataLength / 4), Math.floor(dataLength / 2), dataLength - 1];
        
        testIndices.forEach(index => {
            if (index < dataLength) {
                const rowCol = this.virtualScrollView.getRowColByIndex(index);
                console.log(`项目 ${index}: 第${rowCol.row + 1}行, 第${rowCol.col + 1}列`);
            }
        });
        
        // 触发详细的调试打印
        this.virtualScrollView.debugPrint();
    }

    /** 测试横向滚动和位置跟踪 */
    public testHorizontalScrollWithTracking() {
        console.log("=== 横向滚动位置跟踪测试 ===");
        
        // 启用位置跟踪
        this.virtualScrollView.setPositionTracking(true);
        
        // 打印初始状态
        console.log("初始状态:");
        this.virtualScrollView.debugPrint();
        
        // 测试滚动到不同位置
        const dataLength = this.virtualScrollView.getDataLength();
        const testPositions = [
            Math.floor(dataLength * 0.25),  // 25%位置
            Math.floor(dataLength * 0.5),   // 50%位置
            Math.floor(dataLength * 0.75),  // 75%位置
            dataLength - 1                  // 最后一个
        ];
        
        let currentStep = 0;
        
        const performNextTest = () => {
            if (currentStep >= testPositions.length) {
                console.log("横向滚动测试完成!");
                this.virtualScrollView.printPositionTrackingInfo();
                return;
            }
            
            const targetIndex = testPositions[currentStep];
            console.log(`\n步骤 ${currentStep + 1}: 滚动到项目 ${targetIndex}`);
            
            this.virtualScrollView.scrollToIndex(targetIndex, 0.3);
            
            // 等待滚动完成后检查状态
            this.scheduleOnce(() => {
                console.log(`滚动到项目 ${targetIndex} 后的状态:`);
                this.virtualScrollView.debugPrint();
                
                currentStep++;
                this.scheduleOnce(performNextTest, 0.5);
            }, 0.5);
        };
        
        // 开始测试
        performNextTest();
    }

    /** 检查横向滚动问题 */
    public checkHorizontalScrollIssue() {
        console.log("=== 检查横向滚动问题 ===");
        
        const layoutInfo = this.virtualScrollView.getLayoutInfo();
        if (!layoutInfo.isHorizontal) {
            console.log("⚠ 当前不是横向模式！请检查ScrollView设置");
            return;
        }
        
        // 获取滚动信息
        const scrollViewInfo = this.virtualScrollView.getScrollViewInfo();
        console.log("ScrollView设置:", scrollViewInfo);
        
        // 启用位置跟踪
        this.virtualScrollView.setPositionTracking(true);
        
        // 立即打印详细调试信息
        this.virtualScrollView.debugPrint();
        
        // 手动滚动一小段距离测试
        console.log("\n测试手动滚动...");
        const scrollView = this.virtualScrollView['scrollView'];
        const currentOffset = scrollView.getScrollOffset();
        
        // 向右滚动100像素
        const newOffset = cc.v2(currentOffset.x + 100, currentOffset.y);
        scrollView.scrollToOffset(newOffset, 0.2);
        
        this.scheduleOnce(() => {
            console.log("滚动100像素后:");
            this.virtualScrollView.debugPrint();
        }, 0.3);
    }

    /** 测试横向滚动修复 */
    public testHorizontalScrollFix() {
        console.log("=== 测试横向滚动修复 ===");
        
        // 启用位置跟踪（简化输出）
        this.virtualScrollView.setPositionTracking(true);
        
        // 测试滚动到不同位置
        const dataLength = this.virtualScrollView.getDataLength();
        const testIndices = [
            50,   // 滚动到第50个项目
            150,  // 滚动到第150个项目
            300,  // 滚动到第300个项目
            500   // 滚动到第500个项目
        ];
        
        let currentTest = 0;
        
        const performTest = () => {
            if (currentTest >= testIndices.length) {
                console.log("✓ 横向滚动测试完成！");
                this.virtualScrollView.printPositionTrackingInfo();
                return;
            }
            
            const targetIndex = testIndices[currentTest];
            if (targetIndex >= dataLength) {
                currentTest++;
                this.scheduleOnce(performTest, 0.1);
                return;
            }
            
            console.log(`\n测试 ${currentTest + 1}: 滚动到项目 ${targetIndex}`);
            this.virtualScrollView.scrollToIndex(targetIndex, 0.3);
            
            currentTest++;
            this.scheduleOnce(performTest, 1.0);
        };
        
        performTest();
    }

    protected onDestroy() {
        this.node.off("VirtualScrollItemEvent", this.onItemEvent, this);
        if (this.virtualScrollView && this.virtualScrollView.node) {
            this.virtualScrollView.node.off("VirtualScrollViewReady", this.onVirtualScrollViewReady, this);
        }
    }
} 
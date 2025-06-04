const { ccclass, property } = cc._decorator;

@ccclass
export default class HorizontalScrollFix extends cc.Component {

    @property(cc.Node)
    content: cc.Node = null;

    private startPos: cc.Vec2 = null;
    private lastMovePos: cc.Vec2 = null;
    private startContentX: number = 0; // 记录开始触摸时content的x位置
    private isHorizontalMove = false;
    private threshold = 10; // 最小移動距離，用于判断滑动方向

    // 滚动边界
    private leftBoundary: number = 0;
    private rightBoundary: number = 0;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this, true);

        // 如果没有指定content，使用第一个子节点
        if (!this.content && this.node.childrenCount > 0) {
            this.content = this.node.children[0];
        }

        // 计算滚动边界
        this.calculateScrollBoundary();
    }

    start() {
        // 确保在start中再次计算边界，此时content的尺寸已经确定
        this.scheduleOnce(() => {
            this.calculateScrollBoundary();
        }, 0);
    }

    /**
     * 计算滚动边界
     */
    private calculateScrollBoundary(): void {
        if (!this.content) return;

        const viewWidth = this.node.width;
        const contentWidth = this.content.width;

        // 左边界（内容向右滚动的最大距离）
        this.leftBoundary = 0;
        
        // 右边界（内容向左滚动的最大距离）
        this.rightBoundary = Math.max(0, contentWidth - viewWidth);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        this.startPos = event.getLocation();
        this.lastMovePos = this.startPos;
        this.isHorizontalMove = false;
        
        // 记录开始触摸时content的位置
        if (this.content) {
            this.startContentX = this.content.x;
        }
    }

    onTouchMove(event: cc.Event.EventTouch) {
        const movePos = event.getLocation();
        const delta = movePos.sub(this.startPos);
        
        if (!this.isHorizontalMove) {
            // 判断是否为横向移动
            if (Math.abs(delta.x) > this.threshold && Math.abs(delta.x) > Math.abs(delta.y)) {
                this.isHorizontalMove = true;
                // 阻止事件向父節點（縱向 ScrollView）傳遞
                event.stopPropagation();
            }
        } 
        
        if (this.isHorizontalMove) {
            event.stopPropagation(); // 已確定是橫向移動，阻止事件传播
            
            if (this.content) {
                // 计算新的X位置 = 初始位置 + 移动距离
                let newX = this.startContentX + delta.x;
                
                // 边界限制
                newX = cc.misc.clampf(newX, -this.rightBoundary, this.leftBoundary);
                
                this.content.x = newX;
            }
        }
        
        this.lastMovePos = movePos;
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        this.isHorizontalMove = false;
    }

    /**
     * 重新计算滚动区域（当内容发生变化时调用）
     */
    public refreshScrollView(): void {
        this.calculateScrollBoundary();
        
        // 确保当前位置在有效范围内
        if (this.content) {
            const currentX = this.content.x;
            const clampedX = cc.misc.clampf(currentX, -this.rightBoundary, this.leftBoundary);
            if (currentX !== clampedX) {
                this.content.x = clampedX;
            }
        }
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
}

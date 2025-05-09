const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollLazyLoader extends cc.Component {
    @property(cc.ScrollView)
    private scrollView: cc.ScrollView = null;
    @property(cc.Node)
    public content: cc.Node = null;

    @property(cc.Prefab)
    private itemPrefab: cc.Prefab = null;

    @property({ tooltip: "一次載入的項目數量" })
    private loadCount: number = 4;

    @property({ tooltip: "項目上掛載的 Component 名稱，例如 'ItemScript'" })
    private itemScriptName: string = "ItemScript";

    private itemPool: cc.NodePool = new cc.NodePool();
    private allData: any[] = [];
    private loadedCount: number = 0;
    private pooledNodes: Set<cc.Node> = new Set(); // 自建集合記錄來自物件池的節點

    protected onLoad() {
        this.scrollView.node.on('scroll-to-bottom', this.onScrollToBottom, this);
    }

    public scrollToTop() {
        this.scrollView.scrollToTop(0);
    }

    /** 更新資料並刷新顯示 */
    public refreshData(newData: any[]) {
        const content = this.content;
        const oldItems = [...content.children];
    
        for (const child of oldItems) {
            if (this.pooledNodes.has(child)) {
                child.off("ItemEvent", this.onItemEvent, this);
                content.removeChild(child);
                this.itemPool.put(child);
                this.pooledNodes.delete(child); // 移除追蹤記錄
            }
        }
    
        // 重設資料
        this.allData = newData;
        this.loadedCount = 0;
    
        // 載入首批資料
        this.loadNextBatch();
    }

    private loadNextBatch() {
        const content = this.content;
    
        for (let i = 0; i < this.loadCount; i++) {
            if (this.loadedCount >= this.allData.length) return;
    
            const data = this.allData[this.loadedCount++];
            let item: cc.Node = this.itemPool.size() > 0
                ? this.itemPool.get()
                : cc.instantiate(this.itemPrefab);
    
            // 添加事件監聽（假設子物件用 "ItemEvent" 發送事件）
            item.on("ItemEvent", this.onItemEvent, this);
    
            content.addChild(item);
            this.pooledNodes.add(item);
    
            // ⏬ 加入父節點後再取得 index，這樣才會準確
            const index = item.getSiblingIndex();
    
            const comp = item.getComponent(this.itemScriptName);
            if (comp && typeof comp.setData === "function") {
                comp.setData(data, index);
            }
        }
    }

    private onScrollToBottom() {
        this.loadNextBatch();
    }

    private onItemEvent(data) {
        // 可在這裡做前置處理或直接轉發事件
        this.node.emit("ScrollItemEvent", data);
    }
}

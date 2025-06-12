import MegaManager from "../Base/gameMega/MegaManager";

/** 通用工具 */
export class CommonTool {
    /** 取得金額數字字串(根據幣值換算顯示) 
     * @param amount 金額
     * @param fractionDigits 小數四捨五入到第幾位 預設是4
     * @param useGrouping 是否開啟千分位顯示 預設開啟
     * @param unitConvert 是否單位換算 預設是 跑分不需要換算
     * @param minimumFractionDigits 最少顯示小數點後幾位 預設是0 跑分需要強制顯示小數點尾數為0的
     */
    public static coinFormat(amount: number, fractionDigits: number = 4, useGrouping: boolean = true, unitConvert: boolean = true, minimumFractionDigits: number = 2): string {
        let num: string = amount.toString();
        if (num.indexOf(".") !== -1) {
            num = num.substring(0, num.indexOf(".") + (fractionDigits + 1));
        }
        let numStr: string[] = null;
        if (useGrouping) {
            numStr = num.split(".");
            if (numStr[0] && numStr[0].length > 3) {
                numStr[0] = numStr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        }
        if (minimumFractionDigits > 0) {
            if (!numStr) {
                numStr = num.split(".");
            }
            numStr[1] = numStr[1] || "";
            while (numStr[1].length < minimumFractionDigits) {
                numStr[1] += "0";
            }
        }
        if (numStr) {
            num = numStr.join(".");
            numStr = null;
        }
        return num;
        // return new Intl.NumberFormat(undefined, { minimumFractionDigits: minimumFractionDigits, maximumFractionDigits: fractionDigits, useGrouping: useGrouping }).format(amount) + suffix;
    }

    public static convertTimestamp(value: number): string {
		const t = new Date(value);
		const hh = t.getHours() < 10 ? "0" + t.getHours() : t.getHours();
		const mm = t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes()
		const ss = t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds()
		return `${hh}:${mm}:${ss}`;
	}

    public static strFormat(str: string, ...params: (string | number)[]): string {
        return str.replace(/\{(\d+)\}/g, (src: string, idx: string | number) => {
            return params[idx] != null ? `${params[idx]}` : src;
        });
    }

    /**
     * 取得拋物線函數
     * @param time 動作時間
     * @param startPoint 起始點
     * @param endPoint 終點
     * @param height 高度
     * @param angle 角度
     * @returns {cc.ActionInterval}
     * @description 
     * 搭配 easing 可以控制速度曲線  
     * ``getCurveAction(...).easing(cc.easeInOut(0.5);``
     */
    public static getCurveAction(time: number, startPoint: cc.Vec2, endPoint: cc.Vec2, height: number, angle: number,) {
        // 把角度转换为弧度
        let radian = angle * Math.PI / 180;
        // 第一个控制点为抛物线左半弧的中点
        let q1x = startPoint.x + (endPoint.x - startPoint.x) / 4;
        let q1 = cc.v2(q1x, height + startPoint.y + Math.cos(radian) * q1x);
        // 第二个控制点为整个抛物线的中点
        let q2x = startPoint.x + (endPoint.x - startPoint.x) / 2;
        let q2 = cc.v2(q2x, height + startPoint.y + Math.cos(radian) * q2x);

        return cc.bezierTo(time, [q1, q2, endPoint]).easing(cc.easeInOut(0.5));
    }

    public static resourcesLoad(url: string, type): any {
        return new Promise((resolve, reject) => {
            cc.resources.load(url, type, (error, data) => {
                if (error) {

                    reject(null);
                }
                resolve(data);
            });
        });
    }

    public static async sleep(delayTime: number): Promise<void> {
        return new Promise<void>(resolve => cc.director.getScene().getChildByName("Canvas").getComponent(cc.Canvas).scheduleOnce(resolve, delayTime / 1000));
    }

    /** 設定圖片 */
    public static setSprite(obj, sp : cc.SpriteFrame) {
        if(obj == null){

            return;
        }
        let sprite = obj.getComponent(cc.Sprite);
        if(sprite){
            sprite.spriteFrame = sp;
        }else {

        }
    }

    /** 設定文字 */
    public static setLabel(obj : cc.Label, text) {
        if(obj == null){

            return;
        }
        obj.string = (text != null) ? text.toString() : "";
    }

    /** 金額轉換函式 超過1000顯示k ... */
    public static formatMoney(value: number): string {
        if (value >= 1_000_000_000) {
            return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        } else if (value >= 1_000_000) {
            return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (value >= 1_000) {
            return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        } else {
            return value.toString();
        }
    }

    /** 金額轉換函式 顯示貨幣 */
    public static formatMoney2(value: number, specialSymbols : string = ""): string {
        let currency = MegaManager.getInstance().getCurrency();
        return specialSymbols + currency + CommonTool.formatNumber(value);
    }

    /** 圖片轉換 */
    public static loadRemoteImageToSprite(sprite: cc.Sprite, url: string) {
        cc.loader.load({ url: url, type: 'png' }, (err, texture: cc.Texture2D) => {
            if (err) {
                cc.error('載入圖片失敗:', err);
                return;
            }
            const spriteFrame = new cc.SpriteFrame(texture);
            sprite.spriteFrame = spriteFrame;
        });
    }

    /** 數字轉貨幣單位 */
    public static formatNumber(num: number): string {
        return num.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    public static TransformCardInfo(num : string): number[] {
        // 處理號碼字串 -> 轉為數字陣列，無法轉換則為 null
        const rawNumbers = num.split(',').map(n => {
            const num = Number(n);
            return isNaN(num) ? null : num;
        });

        // 分離有效數字與 null，並對有效數字排序
        const numericPart = rawNumbers.filter(n => typeof n === 'number') as number[];
        const nullCount = rawNumbers.filter(n => n === null).length;
        numericPart.sort((a, b) => a - b);

        // 將 null 插入中間（維持原邏輯）
        const mid = Math.floor(numericPart.length / 2);
        const sortedNumbers = [
            ...numericPart.slice(0, mid),
            ...Array(nullCount).fill(null),
            ...numericPart.slice(mid)
        ];

        return sortedNumbers;
    }

    /**
     * 将日期格式化为 MM/dd/yyyy 格式
     * @param date 要格式化的日期
     * @returns 格式化后的日期字符串，例如 "03/12/2025"
     */
    public static formatDateToMMDDYYYY(date: Date): string {
        const month = CommonTool.padZero(date.getMonth() + 1);    // 月份从0开始，需要+1
        const day = CommonTool.padZero(date.getDate());
        const year = date.getFullYear();
        
        return `${month}/${day}/${year}`;
    }

    /**
     * 数字补零（小于10的数字前面加0）
     * @param num 数字
     * @returns 补零后的字符串
     */
    public static padZero(num: number): string {
        return num < 10 ? `0${num}` : num.toString();
    }

    /**
     * 節流函數
     * 限制函數執行頻率，提升性能
     * @param func 要節流的函數
     * @param delay 延遲時間（毫秒）
     * @returns 節流後的函數
     */
    public static throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
        let lastCall = 0;
        let timeoutId: any = null;
        
        return ((...args: any[]) => {
            const now = Date.now();
            
            if (now - lastCall >= delay) {
                // 立即執行
                lastCall = now;
                func.apply(this, args);
            } else {
                // 清除之前的延遲執行
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                
                // 設置延遲執行
                timeoutId = setTimeout(() => {
                    lastCall = Date.now();
                    func.apply(this, args);
                    timeoutId = null;
                }, delay - (now - lastCall));
            }
        }) as T;
    }

    /**
     * 防抖函數
     * 在事件被觸發後延遲執行，如果在延遲期間再次觸發則重新計時
     * @param func 要防抖的函數
     * @param delay 延遲時間（毫秒）
     * @param immediate 是否立即執行第一次調用，預設為false
     * @returns 防抖後的函數
     * @example
     * // 搜索輸入防抖
     * const debouncedSearch = CommonTool.debounce((keyword: string) => {
     *     console.log('執行搜索:', keyword);
     * }, 300);
     * 
     * // 按鈕點擊防抖
     * const debouncedSubmit = CommonTool.debounce(() => {
     *     console.log('提交表單');
     * }, 1000, true); // 立即執行第一次
     */
    public static debounce<T extends (...args: any[]) => any>(func: T, delay: number, immediate: boolean = false): T {
        let timeoutId: any = null;
        let hasExecuted = false;
        
        return ((...args: any[]) => {
            const executeNow = immediate && !hasExecuted;
            
            // 清除之前的延遲執行
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            if (executeNow) {
                // 立即執行（僅在immediate為true且是第一次調用時）
                hasExecuted = true;
                func.apply(this, args);
            }
            
            // 設置延遲執行
            timeoutId = setTimeout(() => {
                if (!immediate || hasExecuted) {
                    func.apply(this, args);
                }
                hasExecuted = false;
                timeoutId = null;
            }, delay);
        }) as T;
    }


    /**
     * 智能設備模式判斷 (模擬器算作手機)
     * 用於判斷當前環境是否應該使用手機模式配置
     * @returns true: 手機模式, false: 電腦模式
     */
    public static shouldUseMobileMode(): boolean {
        const isMobile = (window as any).isMobile;
        
        if (typeof isMobile === 'undefined') {
            cc.error('[CommonTool.shouldUseMobileMode] window.isMobile 未定義，可能 index.html 的設備判斷邏輯尚未執行，預設返回 false (PC模式)');
            return false;
        }
        
        if (typeof isMobile !== 'boolean') {
            cc.error('[CommonTool.shouldUseMobileMode] window.isMobile 類型錯誤，期望 boolean 但得到', typeof isMobile, '值:', isMobile, '，預設返回 false (PC模式)');
            return false;
        }
        
        return isMobile;
    }

    /**
     * 設置文本混合模式
     * 用於優化RichText在特定背景下的顯示效果
     * @param richText RichText組件或包含RichText的節點
     * @param srcBlendFactor 源混合因子，預設為1 (ONE)
     * @param dstBlendFactor 目標混合因子，預設為771 (ONE_MINUS_SRC_ALPHA)
     * @param delay 延遲執行時間（秒），預設為0，等待RichText初始化完成
     * @example
     * // 基本用法
     * CommonTool.setTextBlendMode(this.richTextNode.getComponent(cc.RichText));
     * 
     * // 自定義混合參數
     * CommonTool.setTextBlendMode(richText, 1, 770, 0.1);
     */
    public static setTextBlendMode(
        target: cc.RichText | cc.Node, 
        srcBlendFactor: number = 1, 
        dstBlendFactor: number = 771,
        delay: number = 0
    ): void {
        // 確定目標RichText組件
        let richText: cc.RichText;
        if (target instanceof cc.RichText) {
            richText = target;
        } else if (target instanceof cc.Node) {
            richText = target.getComponent(cc.RichText);
        } else {
            cc.warn('[CommonTool.setTextBlendMode] 無效的目標參數');
            return;
        }

        if (!richText || !richText.isValid) {
            cc.warn('[CommonTool.setTextBlendMode] 未找到有效的RichText組件');
            return;
        }

        // 延遲執行，確保RichText已完全初始化
        const executeBlendSetting = () => {
            if (!richText || !richText.isValid) return;
            
            try {
                // 獲取RichText的所有Label子組件
                const labels = richText.node.getComponentsInChildren(cc.Label);
                
                labels.forEach(label => {
                    if (label && label.isValid) {
                        // 設置Label組件的混合模式
                        try {
                            // 直接設置混合因子
                            (label as any).srcBlendFactor = srcBlendFactor;
                            (label as any).dstBlendFactor = dstBlendFactor;
                            
                            // 通過渲染組件設置（備用方法）
                            const node = label.node;
                            if (node && (node as any)._renderComponent) {
                                const renderComp = (node as any)._renderComponent;
                                if (renderComp && renderComp.setBlend) {
                                    renderComp.setBlend(srcBlendFactor, dstBlendFactor);
                                }
                            }
                            
                            // 強制更新渲染狀態
                            const material = label.getMaterial(0);
                            if (material) {
                                label.setMaterial(0, material);
                            }
                        } catch (error) {
                            cc.warn('[CommonTool.setTextBlendMode] 設置Label混合模式失敗:', error);
                        }
                    }
                });
                
                // cc.log(`[CommonTool.setTextBlendMode] 成功設置 ${labels.length} 個Label的混合模式`);
            } catch (error) {
                cc.error('[CommonTool.setTextBlendMode] 執行過程發生錯誤:', error);
            }
        };

        // 根據延遲時間決定執行方式
        if (delay > 0) {
            // 使用Canvas組件的scheduleOnce來延遲執行
            const scene = cc.director.getScene();
            const canvas = scene ? scene.getChildByName("Canvas") : null;
            if (canvas) {
                const canvasComp = canvas.getComponent(cc.Canvas);
                if (canvasComp && canvasComp.scheduleOnce) {
                    canvasComp.scheduleOnce(executeBlendSetting, delay);
                } else {
                    // 備用方案：使用setTimeout
                    setTimeout(executeBlendSetting, delay * 1000);
                }
            } else {
                // 備用方案：使用setTimeout
                setTimeout(executeBlendSetting, delay * 1000);
            }
        } else {
            // 下一幀執行
            richText.string = richText.string;
            executeBlendSetting();
            cc.director.once(cc.Director.EVENT_AFTER_UPDATE, executeBlendSetting);
        }
    }

    // ======================== 按鈕鎖定機制 ========================

    /** 全局按鈕鎖定狀態管理 */
    private static buttonLockMap: Map<string, boolean> = new Map();

    /**
     * 🔒 共用按鈕執行方法 - 統一處理鎖定邏輯
     * @param context 組件上下文（用於 scheduleOnce）
     * @param action 要執行的方法
     * @param lockDuration 鎖定持續時間（秒），預設 0.5 秒
     * @param actionName 操作名稱（用於日誌），預設 "unknown"
     * @param lockKey 鎖定鍵值，預設使用組件 uuid，可自定義實現不同粒度的鎖定
     * @example
     * // 基本用法
     * CommonTool.executeWithLock(this, () => {
     *     PopupManager.showPopup(PopupName.HelpCenterPage);
     * }, 0.5, "OnHelpCenter");
     * 
     * // 自定義鎖定鍵值（實現全局鎖定）
     * CommonTool.executeWithLock(this, () => {
     *     // 執行全局操作
     * }, 1.0, "GlobalAction", "global");
     * 
     * // 頁面級別鎖定
     * CommonTool.executeWithLock(this, () => {
     *     // 執行頁面操作
     * }, 0.5, "PageAction", "PersonalCenterPage");
     */
    public static executeWithLock(
        context: cc.Component,
        action: () => void,
        lockDuration: number = 0.5,
        actionName: string = "unknown",
        lockKey?: string
    ): void {
        // 生成鎖定鍵值
        const key = lockKey || context.uuid || context.node.uuid || "default";
        
        // 🔒 檢查按鈕是否被鎖定
        if (this.buttonLockMap.get(key)) {
            console.warn(`[CommonTool.executeWithLock] 按鈕已鎖定，拒絕執行 ${actionName} (lockKey: ${key})`);
            return;
        }
        
        // 🔒 鎖定按鈕
        this.buttonLockMap.set(key, true);
        
        try {
            // 執行具體操作
            action();
        } catch (error) {
            console.error(`[CommonTool.executeWithLock] 執行 ${actionName} 時發生錯誤:`, error);
        }
        
        // 🔓 延遲解鎖按鈕
        if (context && context.scheduleOnce) {
            context.scheduleOnce(() => {
                this.buttonLockMap.set(key, false);
            }, lockDuration);
        } else {
            // 備用方案：使用 setTimeout
            setTimeout(() => {
                this.buttonLockMap.set(key, false);
            }, lockDuration * 1000);
        }
    }

    /**
     * 🔓 手動解鎖按鈕
     * @param context 組件上下文
     * @param lockKey 鎖定鍵值，預設使用組件 uuid
     */
    public static unlockButton(context: cc.Component, lockKey?: string): void {
        const key = lockKey || context.uuid || context.node.uuid || "default";
        this.buttonLockMap.set(key, false);
        console.log(`[CommonTool.unlockButton] 手動解鎖按鈕 (lockKey: ${key})`);
    }

    /**
     * 🔍 檢查按鈕是否被鎖定
     * @param context 組件上下文
     * @param lockKey 鎖定鍵值，預設使用組件 uuid
     * @returns true: 已鎖定, false: 未鎖定
     */
    public static isButtonLocked(context: cc.Component, lockKey?: string): boolean {
        const key = lockKey || context.uuid || context.node.uuid || "default";
        return this.buttonLockMap.get(key) || false;
    }

    /**
     * 🧹 清理所有按鈕鎖定狀態（場景切換時使用）
     */
    public static clearAllButtonLocks(): void {
        this.buttonLockMap.clear();
        console.log("[CommonTool.clearAllButtonLocks] 已清理所有按鈕鎖定狀態");
    }

    /** 取得金額數字字串(根據幣值換算顯示) */
    public static getCurrencyText(amount: number, currency: string): string {
        let result: string = "0";
        if(amount == undefined || amount == null) {
            return result;
        }
        let value: number = amount;
        switch(currency) {
            case "IDR": value = amount / 100; break;
            case "VND": value = amount / 100; break;
            case "PHP": value = amount / 100; break;
            case "THB": value = amount / 100; break;
            case "BDT": value = amount / 100; break;
            case "MMK": value = amount / 100; break;
            case "KHR": value = amount / 10; break;
            case "INR": value = amount / 100; break;
            case "RUB": value = amount / 100; break;
            case "TRY": value = amount / 100; break;
            case "BRL": value = amount / 100; break;
            case "MXN": value = amount / 100; break;
            case "CLP": value = amount; break;
            case "JPY": value = amount; break;
            case "KRW": value = amount; break;
            case "NGN": value = amount / 100; break;
            case "PKR": value = amount / 100; break;
            case "LKR": value = amount / 100; break;
            case "NPR": value = amount / 100; break;
            case "LAK": value = amount / 100; break;
            case "MYR": value = amount / 100; break;
        }
        return this.numberWithCommas(value);
    }

    /** 判斷是否為開發環境 */
    public static isDebugMode(): boolean {
        if (typeof CC_DEBUG === 'undefined') return false;
        return CC_DEBUG;
    }

    /** 將數字轉為有千分位的字串 */
    public static numberWithCommas(number: number): string {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /** 將數字添加單位（K、M、B等） */
    public static formatNumberWithUnit(number: number): string {
        if (number >= 1000000000) return (number / 1000000000).toFixed(1) + "B";
        if (number >= 1000000) return (number / 1000000).toFixed(1) + "M";
        if (number >= 1000) return (number / 1000).toFixed(1) + "K";
        return number.toString();
    }

    /** 取得當前的時間戳記 */
    public static getCurrentTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }

    /** 延遲執行 */
    public static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** 深拷貝對象 */
    public static deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime()) as any;
        if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as any;
        if (typeof obj === 'object') {
            const cloned = {} as T;
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    }

    /** 混洗陣列 */
    public static shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /** 限制數值在指定範圍內 */
    public static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    /** 線性插值 */
    public static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * this.clamp(t, 0, 1);
    }
}

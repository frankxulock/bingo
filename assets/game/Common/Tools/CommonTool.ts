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
                    console.error("Error loading resource", error);
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
            console.error("無法找到對應的Obj 物件");
            return;
        }
        let sprite = obj.getComponent(cc.Sprite);
        if(sprite){
            sprite.spriteFrame = sp;
        }else {
            console.error("目標沒有Sprite元件 對象 => ", obj);
        }
    }

    /** 設定文字 */
    public static setLabel(obj : cc.Label, text) {
        if(obj == null){
            console.error("無法找到對應的Obj Label物件");
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
     * 智能設備模式判斷 (模擬器算作手機)
     * 用於判斷當前環境是否應該使用手機模式配置
     * @returns true: 手機模式, false: 電腦模式
     */
    public static shouldUseMobileMode(): boolean {
        const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const ratio = height / width;

        // 基本條件判斷
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isPortrait = ratio > 1;
        const isSmallScreen = Math.min(width, height) <= 768;
        const isMobileUA = /android|iphone|ipad|ipod|windows phone/i.test(ua);

        // 擴展條件：包含模擬器的判斷
        const hasPhoneLikeRatio = ratio > 1.2 && ratio < 2.5;
        const hasReasonableSize = width >= 320 && width <= 450 && height >= 550 && height <= 950;

        // 組合判斷：原始判斷 OR 類似手機的模擬器
        return (isMobileUA || isTouchDevice) && isSmallScreen && isPortrait ||
               (isTouchDevice && hasPhoneLikeRatio && hasReasonableSize);
    }
}

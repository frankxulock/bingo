export class MathUtils {
    private static timer: number = null;
    private static msgStack: string[] = [];

    /** 轉換前端數字 */
    public static div10000(score: number | string, decimalPoint: number = 2): number {
        const dividedScore: number = this.divide(score, 10000.0);
        const powerOfTen: number = Math.pow(10, decimalPoint);

        const multipliedScore: number = this.times(dividedScore, powerOfTen);
        const roundedScore = this.divide(Math.floor(multipliedScore), powerOfTen);
        return Number(roundedScore.toFixed(decimalPoint));
    }

    /** 加法 */
    public static plus(num1: number | string, num2: number | string, ...others: number[] | string[]): number {
        if (others.length > 0) {
            return this.plus(this.plus(num1, num2), others[0], ...others.slice(1));
        }

        if (!this.checkCalculateInput(num1) || !this.checkCalculateInput(num2)) {

            return 0;
        }

        const baseNum = Math.pow(10, Math.max(this.digitLength(num1), this.digitLength(num2)));
        return (this.times(num1, baseNum) + this.times(num2, baseNum)) / baseNum;
    }

    /** 減法 */
    public static minus(num1: number | string, num2: number | string, ...others: number[] | string[]): number {
        if (others.length > 0) {
            return this.minus(this.minus(num1, num2), others[0], ...others.slice(1));
        }

        if (!this.checkCalculateInput(num1) || !this.checkCalculateInput(num2)) {

            return 0;
        }

        const baseNum = Math.pow(10, Math.max(this.digitLength(num1), this.digitLength(num2)));
        return (this.times(num1, baseNum) - this.times(num2, baseNum)) / baseNum;
    }

    /** 乘法 */
    public static times(num1: number | string, num2: number | string, ...others: number[] | string[]): number {
        if (others.length > 0) {
            return this.times(this.times(num1, num2), others[0], ...others.slice(1));
        }

        if (!this.checkCalculateInput(num1) || !this.checkCalculateInput(num2)) {

            return 0;
        }

        const num1Changed = this.float2Fixed(num1);
        const num2Changed = this.float2Fixed(num2);
        const baseNum = this.digitLength(num1) + this.digitLength(num2);
        const leftValue = num1Changed * num2Changed;

        if (!Number.isSafeInteger(leftValue)) {
            MathUtils.debounceWarn(`${leftValue} is beyond boundary, the results may not be accurate`);
        }

        return leftValue / Math.pow(10, baseNum);
    }

    /** 除法 */
    public static divide(num1: number | string, num2: number | string, ...others: number[] | string[]): number {
        if (others.length > 0) {
            return this.divide(this.divide(num1, num2), others[0], ...others.slice(1));
        }

        if (!this.checkCalculateInput(num1) || !this.checkCalculateInput(num2)) {

            return 0;
        }

        const num1Changed = this.float2Fixed(num1);
        const num2Changed = this.float2Fixed(num2);

        return this.times(num1Changed / num2Changed, Math.pow(10, this.digitLength(num2) - this.digitLength(num1)));
    }

    private static checkCalculateInput(input: number | string): boolean {
        if (typeof input !== "string" && typeof input !== "number") {
            return false;
        }
        if (input === null || input === undefined) {
            return false;
        }
        if (isNaN(+input)) {
            return false;
        }
        return true;
    }

    // 小數放大為整數
    private static float2Fixed(num: number | string): number {
        let rtnNumber: number = 0;
        if (num.toString().indexOf("e") === -1) {
            rtnNumber = Number(num.toString().replace(".", ""));
        } else {
            const dLen = this.digitLength(num);
            rtnNumber = dLen > 0 ? Number(num) * Math.pow(10, dLen) : Number(num);
        }

        if (!Number.isSafeInteger(rtnNumber)) {
            MathUtils.debounceWarn(`${num} is beyond boundary when transfer to integer, the results may not be accurate`);
        }
        return rtnNumber;
    }

    // 計算放大位數
    private static digitLength(num: number | string): number {
        const eSplit = num.toString().split(/[eE]/);
        const len = (eSplit[0].split(".")[1] || "").length - +(eSplit[1] || 0);
        return len > 0 ? len : 0;
    }

    // 警告防抖
    private static debounceWarn(msg: string) {
        clearTimeout(MathUtils.timer);

        MathUtils.msgStack.push(msg);
        MathUtils.timer = setTimeout(() => {

            MathUtils.msgStack.length = 0;
        });
    }
}

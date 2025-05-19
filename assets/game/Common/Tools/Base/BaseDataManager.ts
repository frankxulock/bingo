import Singleton from "./Singleton";

export enum CURRENCY_SYMBOL {
    CNY = "¥", // 人民幣
    VND = "₫", // 越南盾
    USD = "$", // 美金
    SGD = "$", // 新加坡幣
    PHP = "₱", // 菲律賓披索
    THB = "฿", // 泰銖
    INR = "₹", // 印度盧比
    USDT = "₮", // 泰達幣
    BRL = "R$", // 巴西雷亞爾
}

export enum SYMBOL_NAME {
    cat = 5,
    dog = 4,
    fxp = 3,
    chui = 1,
    bbt = 2,
    yxj = 0,
    jinpai = 7,
    wild = 6,
    empty = 8,
    random = 99,
}

export class loginData {
    cc?: string //幣種
    cs?: string //幣種符號
    tk?: string //token
}

export default abstract class BaseDataManager extends Singleton {
    /** 單機模式 */
    private static _offLineMode: boolean = undefined;
    public static get offLineMode() {
        return BaseDataManager._offLineMode;
    }

    public static set offLineMode(value) {
        BaseDataManager._offLineMode = value;
    }
    public static http: string = "https://";
    public static serverHost: string = "";
    public static token: string = "";
    public static traceId: string = "";

    /** 玩家ID */
    public playerID: string = "";

    /** 使用的貨幣 */
    public currency: string = "";
    /** 暱稱 */
    public nickname: string = "";
    /** 玩家金錢 */
    public coin: number = 0;
    public loginData: loginData = null;

    /** 初始化 */
    public init(): void {

    }
}

/** 單一實例 */
export default class Singleton {

    /** 取得單一實例 */
    public static getInstance<T extends {}>(this: new () => T): T {
        if (!(<any>this)._instance) {
            (<any>this)._instance = new this();
        }
        return (<any>this)._instance;
    }

    /** 刪除單一實例 */
    public static deleteInstance(): void {
        (<any>this)._instance = null;
    }

}

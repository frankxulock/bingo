import { UrlManager } from "../UrlManager";
import { CommonTool } from "../CommonTool";
import { Common_Language } from "./Common_Language";
import Localize from "./Localize";
import Singleton from "../Base/Singleton";

//狀態
export enum STATUS {
    UNINITIALIZED = 0, //未初始化
    INITIALIZING, //初始化中
    INITIALIZED, //初始化完成
}

export default class LocalizationManager extends Singleton {
    private texts = {};
    public status: STATUS = STATUS.UNINITIALIZED;
    public static language: string = "tw"; //目前使用的語言

    public constructor() {
        super();
        this.init();
    }

    /**
     * 多語系工具初始化
     * @param game 當前進入的遊戲 | GX or LX
     */
    public init(...languageMap): void {
        // 編輯器模式會由選單決定語系
        if (!CC_EDITOR) {
            LocalizationManager.language = UrlManager.getLang();
        }

        this.status = STATUS.INITIALIZING;
        console.log("Language: " + LocalizationManager.language);

        // const commonKeys = Object.keys(Common_Language[LocalizationManager.language]);
        // for (let i = 0; i < commonKeys.length; i++) {
        //     const key = commonKeys[i];
        //     const value = Common_Language[LocalizationManager.language][key];
        //     this.texts[key] = value;
        // }

        for (let i = 0; i < languageMap.length; i++) {
            const map = languageMap[i];
            const languageData = map[LocalizationManager.language];
            if (languageData == null) {
                console.error(`當前遊戲並不支援 ${LocalizationManager.language} 語系`);
                break;
            }
            const keys = Object.keys(languageData);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = map[LocalizationManager.language][key];
                this.texts[key] = value;
            }
        }

        this.status = STATUS.INITIALIZED;
    }

    /**
     * 取得多國語言字串
     * @param {string} key 鍵值
     * @param {string | number} optionalParams 不定長度引數
     * @description csv: 金額不足，你只剩下{0}元，請儲值到{1}銀行。
     * @description 結果: 金額不足，你只剩下100元，請儲值到台灣銀行。
     * @example LocalizationManager.getInstance().get(key, coin, "台灣");
     */
    public get(key: string, ...optionalParams: (string | number)[]): string {
        if (this.status == STATUS.UNINITIALIZED) {
            console.error("多語系未初始化");
            return "";
        }

        if (this.status == STATUS.INITIALIZING) {
            console.error("多語系未建立完成");
            return "";
        }

        if (!this.texts[key]) {
            console.error("text key not found - key = " + key);
            return "";
        }
        return CommonTool.strFormat(this.texts[key], ...optionalParams);
    }

    public editorGetSpriteFrame(uuid): Promise<cc.SpriteFrame> {
        return new Promise((resolve) => {
            cc.assetManager.loadAny({ type: "uuid", uuid: uuid }, (err, texture) => {
                if (err) console.log("load i18n image failed", uuid);
                resolve(texture);
            });
        });
    }

    public updateCurrentLangImage(target: cc.Node | cc.Sprite): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let localize: Localize;
            let path: string;
            let sprite: cc.Sprite;
            if (target instanceof cc.Node) {
                localize = target.getComponent("Localize");
                path = localize.spriteFramePath;
                sprite = target.getComponent(cc.Sprite);
            } else if (target instanceof cc.Sprite) {
                localize = target.node.getComponent("Localize");
                path = localize.spriteFramePath;
                sprite = target;
            }

            // 取得當前語系圖片
            let _pathTemp = path.split("/");
            const index = _pathTemp.findIndex((element) => element === "Localize");
            _pathTemp[index + 1] = LocalizationManager.language;
            let _path = _pathTemp.join("/");
            const res: cc.SpriteFrame = await CommonTool.resourcesLoad(_path, cc.SpriteFrame) as cc.SpriteFrame;

            sprite.spriteFrame = res;
            localize.isInit = true;
            resolve(null);
        });
    }
}
LocalizationManager.getInstance(); // 先實例取得 url 的語系

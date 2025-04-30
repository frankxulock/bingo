import { CommonTool } from "../CommonTool";
import LocalizationManager from "./LocalizationManager";

export enum LOCALIZE_TYPE {
    TEXT, // 文字
    IMAGE, // 圖片
    SPINE, // spine
    SPINE_I18N_BASE_ON_ANIMATION, // spine 使用 animation 處理多語系
}

export enum LANGUAGE {
    "tw",
    "zh",
    "en",
    "pt",
    "vi",
}

const { ccclass, property, menu, executeInEditMode } = cc._decorator;

@ccclass("I18nLocalizeItem")
export class I18nLocalizeItem {

    @property({
        type: cc.Enum(LANGUAGE),
        displayName: "語言",
    })
    private languageOption: LANGUAGE = LANGUAGE["tw"];
    public get i18nType(): string {
        return LANGUAGE[this.languageOption];
    }

    @property(cc.Vec3)
    public position: cc.Vec3 = null;

    @property(cc.Integer)
    public scale: number = 1;
}

@ccclass("PIC_SETTING")
export class PIC_SETTING {
    @property({ visible: false })
    private data = {};
    constructor() {
        for (let i = 0; i < Object.keys(LANGUAGE).length; i++) {
            this.data[LANGUAGE[i]] = cc.Vec2.ZERO;
        }
    }
    @property({ type: cc.Enum(LANGUAGE) })
    private lang: LANGUAGE = LANGUAGE[LocalizationManager.language];
    @property(cc.Vec2)
    get position() {
        return this.data[LANGUAGE[this.lang]];
    }
    set position(pos: cc.Vec2) {
        this.data[LANGUAGE[this.lang]] = pos;
    }
}
@ccclass("WRAPPED_PICS")
export class WRAPPED_PICS {
    @property(cc.Node)
    target: cc.Node = null;
    @property(PIC_SETTING)
    config: PIC_SETTING = null;
}

@ccclass("WRAPPED_TEXTS")
export class WRAPPED_TEXTS {
    @property(cc.Node)
    target: cc.Node = null;
    @property(PIC_SETTING)
    config: PIC_SETTING = null;
}

@ccclass
@menu("自訂工具/多語系")
@executeInEditMode
export default class Localize extends cc.Component {
    // ---------- 聲明變數 -------------------------------------------------------------------------------------------
    @property({
        type: cc.Enum(LOCALIZE_TYPE),
    })
    private localizeType: LOCALIZE_TYPE = LOCALIZE_TYPE.TEXT;

    @property({
        visible: function () {
            // @ts-ignore
            return this.localizeType == LOCALIZE_TYPE.TEXT;
        },
    })
    private localizeTextKey: string = "";

    @property({
        visible: function () {
            // @ts-ignore
            return this.localizeType == LOCALIZE_TYPE.TEXT;
        },
        type: [cc.String],
    })
    private optionalParams: string[] = [];

    @property({
        visible: function () {
            // @ts-ignore
            return this.localizeType == LOCALIZE_TYPE.TEXT;
        },
    })
    private aroundPics: boolean = false;

    @property({
        visible: function () {
            // @ts-ignore
            return this.localizeType == LOCALIZE_TYPE.TEXT && this.aroundPics == true;
        },
        type: [WRAPPED_PICS],
    })
    private pictures = [];

    @property({
        displayName: "警告!! ",
        readonly: true,
        editorOnly: true,
        serializable: false, // 取消序列化该属性
        visible: function () {
            // @ts-ignore
            return (this.localizeType == LOCALIZE_TYPE.IMAGE || this.localizeType == LOCALIZE_TYPE.SPINE) && this.bundle == "";
        },
    })
    public bundleWarningTips: string = "請將資源放在 resources or bundle 中。";

    @property({
        readonly: true,
        visible: function () {
            // @ts-ignore
            if (this.localizeType == LOCALIZE_TYPE.IMAGE) {
                // @ts-ignore
                if (!this.spriteFramePath) {
                    // @ts-ignore
                    this.autoGetSpriteFramePath();
                }
                // @ts-ignore
            } else if (this.localizeType == LOCALIZE_TYPE.SPINE) {
                // @ts-ignore
                this.autoGetSpineSkeletonDataPath();
            }

            // @ts-ignore
            return (this.localizeType == LOCALIZE_TYPE.IMAGE || this.localizeType == LOCALIZE_TYPE.SPINE) && this.bundle.length > 0;
        },
    })
    public bundle: string = "";

    @property({
        readonly: true,
        visible: function () {
            // @ts-ignore
            return this.localizeType == LOCALIZE_TYPE.IMAGE && this.spriteFramePath.length > 0;
        },
        multiline: true,
        displayName: "Path",
    })
    public spriteFramePath: string = "";

    @property({
        visible: function () {
            // @ts-ignore
            if (this.localizeType == LOCALIZE_TYPE.IMAGE) {
                return true;
            }
        }
    })
    private useI18n: boolean = false;

    @property({
        type: [I18nLocalizeItem], visible: function () {
            return this.useI18n;
        }
    })
    public i18nReferenceList: I18nLocalizeItem[] = [];

    @property({
        visible: function () {
            // @ts-ignore
            return this.localizeType == LOCALIZE_TYPE.IMAGE;
        },
    })
    private aroundTexts: boolean = false;

    @property({
        visible: function () {
            // @ts-ignore
            return this.localizeType == LOCALIZE_TYPE.IMAGE && this.aroundTexts == true;
        },
        type: [WRAPPED_PICS],
    })
    private texts = [];

    @property({
        readonly: true,
        visible: function () {
            // @ts-ignore
            return this.localizeType == LOCALIZE_TYPE.SPINE && this.spineSkeletonDataPath.length > 0;
        },
        multiline: true,
        displayName: "Path",
    })
    public spineSkeletonDataPath: string = "";

    @property({
        type: [cc.String],
        visible: function () {
            // @ts-ignore
            return this.localizeType == LOCALIZE_TYPE.SPINE_I18N_BASE_ON_ANIMATION;
        },
        displayName: "扣除語系的後綴的 Animation 名稱",
    })
    public spineAnimationList: string[] = [];

    @property({ displayName: "是否客製化" })
    private isCustom: boolean = false;

    @property({
        type: cc.Enum(cc.Label.HorizontalAlign),
        displayName: "norm lab水平對齊方式",
        visible: function () {
            // @ts-ignore
            return this.isCustom && this.localizeType == LOCALIZE_TYPE.TEXT;
        },
    })
    private customHAlignNorm: cc.Label.HorizontalAlign = cc.Label.HorizontalAlign.CENTER;

    @property({
        type: cc.Enum(cc.macro.TextAlignment),
        displayName: "rich lab水平對齊方式",
        visible: function () {
            // @ts-ignore
            return this.isCustom && this.localizeType == LOCALIZE_TYPE.TEXT;
        },
    })
    private customHAlignRich: cc.macro.TextAlignment = cc.macro.TextAlignment.CENTER;

    // ---------- 成員變數 --------------------------------------------------------------------------------------------

    private sprite: cc.Sprite = null;
    private spriteFrameUuid: string = "";

    private spine: sp.Skeleton = null;
    private spineSkeletonDataUuid: string = "";

    /** 上次有使用圖片的 spriteFrame 的 uuid */
    private lastImageUuid: string = null;
    private index: number = null;

    public isInit: boolean = false;

    // ---------- 生命週期 --------------------------------------------------------------------------------------------

    onLoad() {
        if (CC_EDITOR) {
            if (this.localizeType == LOCALIZE_TYPE.SPINE_I18N_BASE_ON_ANIMATION) {
                this.initSpineAnimation();
            }
            return;
        }
        if (!this.isInit) {
            this.isInit = true;
            this.init();
        }
    }

    // ---------- 監聽事件 --------------------------------------------------------------------------------------------

    // ---------- 觸碰事件 --------------------------------------------------------------------------------------------

    // ---------- 外部呼叫 --------------------------------------------------------------------------------------------

    // ---------- 內部使用 --------------------------------------------------------------------------------------------
    /** 初始化 */
    private init() {
        // 初始化流程
        if (this.localizeType == LOCALIZE_TYPE.TEXT) {
            this.setLocalizeText();
        } else if (this.localizeType == LOCALIZE_TYPE.IMAGE) {
            if (CC_EDITOR) {
                this.setLocalizeImage();
            }

            if (this.node.getComponent(cc.Sprite).spriteFrame) {
                this.setLocalizeImage();
            }
        } else if (this.localizeType == LOCALIZE_TYPE.SPINE) {
            this.setLocalizeSpine();
        } else if (this.localizeType == LOCALIZE_TYPE.SPINE_I18N_BASE_ON_ANIMATION) {
            this.setDefaultAnimation();
        }
    }

    /**設定本地文字 */
    private setLocalizeText() {
        if (this.localizeTextKey == "") {
            return;
        }

        let label = this.node.getComponent(cc.Label);
        let richText = this.node.getComponent(cc.RichText);
        let editBox = this.node.getComponent(cc.EditBox);
        let fontFamily: string = "Microsoft Yahei, Arial";

        let _string = LocalizationManager.getInstance().get(this.localizeTextKey, ...this.optionalParams);

        if (cc.isValid(label)) {
            label.string = _string;
            if (fontFamily) {
                label.fontFamily = fontFamily;
            }
            // this.scheduleOnce(() => {
            //     if (this.isCustom) {
            //         label.horizontalAlign = this.customHAlignNorm;
            //     } else {
            //         const row = Math.floor(this.node.height / label.lineHeight);
            //         if (row == 1) label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            //         else label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            //     }
            // }, 0);
        } else if (cc.isValid(richText)) {
            richText.string = _string;
            if (fontFamily) {
                richText.fontFamily = fontFamily;
            }
            this.scheduleOnce(() => {
                if (this.isCustom) {
                    richText.horizontalAlign = this.customHAlignRich;
                } else {
                    const row = Math.floor(this.node.height / richText.lineHeight);
                    if (row == 1) richText.horizontalAlign = cc.macro.TextAlignment.CENTER;
                    else richText.horizontalAlign = cc.macro.TextAlignment.LEFT;
                }
            }, 0);
        } else if (cc.isValid(editBox)) {
            editBox.string = _string;
            editBox.placeholder = editBox.string;
            if (fontFamily) {
                editBox.textLabel.fontFamily = fontFamily;
            }
        } else {
            console.error("key = " + this.localizeTextKey + "node = " + this.node.name);
            console.error("require a label or rich text to show localize text.");
        }

        if (this.aroundPics) {
            this.pictures.forEach((node) => {
                node.target.setPosition(node.config.data[LocalizationManager.language]);
            });
        }
    }

    /**設定本地圖片 */
    private async setLocalizeImage() {
        let sprite = this.node.getComponent(cc.Sprite);
        let language = LocalizationManager.language;
        let spriteFramePath: string;
        if (CC_EDITOR) {
            // 若在切換到沒有對應圖檔的語系，有機會沒有 spriteFrame，那在下次切換的時候去使用上一次成功套用圖片的 spriteFrame 作為路徑的處理目標
            spriteFramePath = Editor.remote.assetdb.uuidToUrl(sprite.spriteFrame ? sprite.spriteFrame._uuid : this.lastImageUuid);
        } else {
            spriteFramePath = this.spriteFramePath;
        }

        let pathTemp = spriteFramePath.split("_");
        pathTemp[pathTemp.length - 1] = language;
        let path = pathTemp.join("_");

        if (this.aroundTexts) {
            this.texts.forEach((node) => {
                node.target.setPosition(node.config.data[LocalizationManager.language]);
            });
        }

        if (CC_EDITOR) {
            let uuid = Editor.remote.assetdb.urlToUuid(path);

            // 處理副檔名轉換問題
            if (!uuid) {
                path = this.switchImgExtention(path);
                uuid = Editor.remote.assetdb.urlToUuid(path);
            }

            // 缺圖狀況不換圖
            if (!uuid) {
                /** 去掉副檔名的圖片路徑 */
                let missingImagePath = path.split(".")[0];
                Editor.warn("缺少對應多語系圖片", missingImagePath);
                return;
            }

            sprite.spriteFrame = await LocalizationManager.getInstance().editorGetSpriteFrame(uuid);
        } else {
            sprite.spriteFrame = null; // 先移除原本的，避免瞬間閃現在開發階段預設的圖
            sprite.spriteFrame = await CommonTool.resourcesLoad(path, cc.SpriteFrame) as cc.SpriteFrame;
        }

        // 為了解決切換到沒對應圖片的語系後，spriteFrame 再也無法出現的問題，在每次圖片正常使用的時候都會把 uuid 記錄下來
        if (sprite.spriteFrame) {
            this.lastImageUuid = sprite.spriteFrame._uuid;
        }

        this.setI18nImageData();
    }

    /**
     * 處理副檔名轉換問題
     * 1. 副檔名 png 對應到 webp 轉換失敗  
     * 2. 副檔名 webp 對應到 png 轉換失敗  
     * @param _path 原本語系對應的多語系路徑
     */
    private switchImgExtention(_path: string): string {
        if (_path.includes(".png")) {
            _path = _path.replace(".png", ".webp");
        } else {
            _path = _path.replace(".webp", ".png");
        }

        return _path;
    }

    private async setLocalizeSpine(): Promise<void> {
        let spine: sp.Skeleton = this.node.getComponent(sp.Skeleton);
        let language = LocalizationManager.language;
        let pathTemp = this.spineSkeletonDataPath.split("/");
        let pathTemp2 = pathTemp[pathTemp.length - 2].split("_")
        pathTemp2[pathTemp2.length - 1] = language;
        let path = pathTemp2.join("_");
        pathTemp[pathTemp.length - 2] = path;
        path = pathTemp.join("/");
        let animation: string = spine.animation;
        spine.skeletonData = null; // 先移除原本的，避免瞬間閃現在開發階段預設的 spine
        let skeletonData: sp.SkeletonData = await CommonTool.resourcesLoad(path, sp.SkeletonData) as sp.SkeletonData;
        spine.skeletonData = skeletonData;
        spine.animation = animation; // 會直接播放原本設定的 animation
    }

    private initSpineAnimation(): void {
        this.spineAnimationList = [];

        let spine: sp.Skeleton = this.node.getComponent(sp.Skeleton);
        if (!spine) {
            console.error("請確認此物件為 spine");
            return;
        }

        let animationList: spine.Animation[] = spine.skeletonData.getRuntimeData(true).animations;
        let keyList: string[] = [];
        animationList.forEach((animation) => {
            let splitList: string[] = animation.name.split("_");
            splitList.pop();
            if (!keyList.includes(splitList.join("_"))) {
                keyList.push(splitList.join("_"));
            }
        });
        keyList.forEach((key) => {
            this.spineAnimationList.push(key);
        });
    }

    /** 初始化自動依照語系播放預設 animation */
    private setDefaultAnimation(): void {
        let spine: sp.Skeleton = this.node.getComponent(sp.Skeleton);
        if (!spine) {
            return;
        }
        let language = LocalizationManager.language;
        let splitList: string[] = spine.animation.split("_");
        splitList.pop();
        splitList.push(language);
        let animation: string = splitList.join("_");
        spine.setAnimation(0, animation, spine.loop);
    }

    /** 依照 animation 控制 spine 多語系的時候使用此方法替代直接使用 spine 的 setAnimation */
    public playI18NSpine(trackIndex: number, animation: string, loop: boolean): spine.TrackEntry {
        if (this.localizeType !== LOCALIZE_TYPE.SPINE_I18N_BASE_ON_ANIMATION) {
            console.error("此物件非基於 Animation 操控多語系的 Spine");
            return;
        }

        let spine: sp.Skeleton = this.node.getComponent(sp.Skeleton);
        if (!spine) {
            console.error("請確認此物件為 Spine");
            return;
        }

        if (!this.spineAnimationList.includes(animation)) {
            console.warn("請輸入正確 Animation Name，多語系情況在播放時請忽略 '_語系' 再傳入此方法");
            console.warn("name_zh-sc 請輸入 name 即可");
            return;
        }
        let language = LocalizationManager.language;
        let animationName: string = animation + "_" + language;
        return spine.setAnimation(trackIndex, animationName, loop);
    }

    /** 自動取得圖片位置 */
    protected autoGetSpriteFramePath() {
        if (cc.isValid(this.sprite) == false) {
            this.sprite = this.node.getComponent(cc.Sprite);
        }

        if (cc.isValid(this.sprite)) {
            if (this.spriteFrameUuid != this.sprite.spriteFrame._uuid) {
                this.changeSpritePath();
            }
        }
    }

    /** 更換圖片位置 */
    private async changeSpritePath() {
        let _path = Editor.remote.assetdb.uuidToUrl(this.sprite.spriteFrame._uuid);
        let bundleName = await this.getBundleNameOfSprite(_path);
        if (!bundleName) {
            this.bundle = "";
            this.spriteFramePath = "";
        }
        this.spriteFrameUuid = this.sprite.spriteFrame._uuid;
    }

    /** 自動取得 spine 位置 */
    protected autoGetSpineSkeletonDataPath() {
        if (cc.isValid(this.spine) == false) {
            this.spine = this.node.getComponent(sp.Skeleton);
        }

        if (cc.isValid(this.spine)) {
            if (this.spineSkeletonDataUuid != this.spine.skeletonData._uuid) {
                this.changeSpinePath();
            }
        }
    }

    /** 更換 spine 位置 */
    private async changeSpinePath() {
        let _path = Editor.remote.assetdb.uuidToUrl(this.spine.skeletonData._uuid);
        let bundleName = await this.getBundleNameOfSpine(_path);
        if (!bundleName) {
            this.bundle = "";
            this.spineSkeletonDataUuid = "";
        }
        this.spineSkeletonDataUuid = this.spine.skeletonData._uuid;
    }

    private async getBundleNameOfSprite(p_path: string) {
        p_path = p_path.replace("db://assets/", "");

        // 處理 webp 情境，其他的都是 png，日後有別的圖片格式的話需要再新增
        if (p_path.includes(".webp")) {
            p_path = p_path.split(".webp/")[0];
        } else {
            p_path = p_path.split(".png/")[0];
        }
        let _pathList = p_path.split("/");
        let _bundlePath = "db://assets";
        for (let i: number = 0; i < _pathList.length; i++) {
            _bundlePath = `${_bundlePath}/${_pathList[i]}`;
            let _name = await this.getBundleNameFromMeta(_bundlePath, _pathList[i]);
            if (_name) {
                this.bundle = _name;
                this.spriteFramePath = p_path.split(`${_pathList[i]}/`)[1];
                return _name;
            }
        }
        return null;
    }

    private async getBundleNameOfSpine(p_path: string) {
        p_path = p_path.replace("db://assets/", "");

        // 處理 skel 情境，其他的都是 json
        if (p_path.includes(".skel")) {
            p_path = p_path.split(".skel")[0];
        } else {
            p_path = p_path.split(".json")[0];
        }
        let _pathList = p_path.split("/");
        let _bundlePath = "db://assets";
        for (let i: number = 0; i < _pathList.length; i++) {
            _bundlePath = `${_bundlePath}/${_pathList[i]}`;
            let _name = await this.getBundleNameFromMeta(_bundlePath, _pathList[i]);
            if (_name) {
                this.bundle = _name;
                this.spineSkeletonDataPath = p_path.split(`${_pathList[i]}/`)[1];
                return _name;
            }
        }
        return null;
    }

    private async getBundleNameFromMeta(_path: string, p_defaultName: string): Promise<string> {
        return new Promise((resolve) => {
            let _meta = Editor.remote.assetdb.loadMeta(_path);
            if (_meta) {
                if (_meta.isBundle) {
                    if (!_meta.bundleName) {
                        _meta.bundleName = p_defaultName;
                    }
                    resolve(_meta.bundleName);
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }

    public getTextKey(): string {
        return this.localizeTextKey;
    }

    /** 
     * 不同語系圖片客製化設定
     */
    private setI18nImageData(): void {
        if (this.useI18n) {
            let target: I18nLocalizeItem = this.i18nReferenceList.find(item => {
                let lang = item.i18nType.replace('_', '-');
                return lang === LocalizationManager.language;
            });

            // 設定位置
            if (target && target.position) {
                this.node.setPosition(target.position);
            } else {
                this.node.setPosition(this.node.position);
            }

            // 設定 scale 尺寸
            if (target && target.scale) {
                this.node.scale = target.scale;
            } else {
                this.node.setScale(this.node.scaleX, this.node.scaleY);
            }
        }
    }
}

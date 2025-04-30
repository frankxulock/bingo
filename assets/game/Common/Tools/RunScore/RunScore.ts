import { CommonTool } from "../CommonTool";

const { ccclass, property, menu } = cc._decorator;

export enum RUN_TYPE {
    TIME, //時間
    SPEED, //速度
}

@ccclass
@menu("自訂工具/UI/Effect/跑分效果")
export default class RunScore extends cc.Component {
    @property({ type: cc.Enum(RUN_TYPE) })
    private runType: RUN_TYPE = RUN_TYPE.SPEED;

    // @ts-ignore eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    @property({ type: cc.Float, tooltip: "每秒變化的數字", visible: function () { return this.runType == RUN_TYPE.SPEED; } })
    private runSpeed: number = 10; //每秒移動的數字

    // @ts-ignore eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    @property({ type: cc.Float, tooltip: "變換的秒數", visible: function () { return this.runType == RUN_TYPE.TIME; } })
    private runTime: number = 1; //可用分數

    @property({ tooltip: "是否顯示小數點" })
    private hasDecimalPoint: boolean = false;

    // @ts-ignore eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access 
    @property({ type: cc.Integer, tooltip: "小數點位數", visible: function () { return this.hasDecimalPoint; } })
    private decimalPointCount: number = 2;

    @property({ tooltip: "是否在完成時對齊原始lab小數位數" })
    private alignRefPoint: boolean = false;

    private label: cc.Label = null;
    private runScoreLabel: cc.Label = null;
    private nowScore: number = 0; //現在的分數
    private targetScore: number = 0; //目標的分數
    private preLabelString: string = "";
    private tempRunTime: number = 0; //跑分所經過的時間
    private dtOffset: number = 0; //dt的偏移 避免特殊情況下數字會一致
    private isDone: boolean = false;

    public onLoad(): void {
        if (!this.label) {
            this.label = this.getComponent(cc.Label);

            //創造一個新的label
            this.createRunScoreLabel();
            this.label.enabled = false;
            this.targetScore = this.getCorrectNum(this.label.string);
            this.nowScore = this.getCorrectNum(this.label.string);
            this.preLabelString = this.label.string;
        }
    }

    public update(dt: number): void {
        if (this.label.string != this.preLabelString) {
            this.preLabelString = this.label.string;
            this.nowScore = this.getCorrectNum(this.runScoreLabel.string);
            this.targetScore = this.getCorrectNum(this.label.string);
            this.tempRunTime = 0;
            this.isDone = false;
        }

        if (this.targetScore != this.nowScore) {
            if (this.runType == RUN_TYPE.SPEED) {
                this.runScoreBySpeed(dt);
            } else if (this.runType == RUN_TYPE.TIME) {
                this.runScoreByTime(dt);
            }
        } else if (this.alignRefPoint && !this.isDone) {
            this.doAlignRefPoint();
        }
    }

    public init(): void {
        this.onLoad();
    }

    /** 重製歸零 */
    public resetToZero(): void {
        this.nowScore = 0;
        this.targetScore = 0;
        this.label.string = "0";
        this.preLabelString = "0";
        this.tempRunTime = 0;
        this.runScoreLabel.string = "0";
    }
    public setRunType(type: RUN_TYPE) {
        this.runType = type;
    }

    /** 設定跑分時間 */
    public setRunTime(p_runTime: number): void {
        this.runTime = p_runTime;
    }

    /** 取得跑分時間 */
    public getRunTime(): number {
        return this.runTime;
    }

    /** 設定跑分速度 */
    public setRunSpeed(p_runSpeed: number) {
        this.runSpeed = p_runSpeed;
    }

    /** 取得跑分速度 */
    public getRunSpeed(): number {
        return this.runSpeed;
    }

    public getCorrectNum(str: string): number {
        return Number(str.replace(new RegExp("[,a-zA-Z]", "gm"), ""));
    }

    /** 設定跑分的分數 (這是直接到這個分數) */
    public setRunScoreLabel(p_score: number): void {
        this.targetScore = p_score;
        this.preLabelString = p_score.toString();

        if (this.hasDecimalPoint) {
            this.nowScore = p_score;

            if (this.alignRefPoint) {
                this.doAlignRefPoint();
            } else {
                this.runScoreLabel.string = CommonTool.coinFormat(p_score, this.decimalPointCount, false, false, this.decimalPointCount);
            }
        } else {
            if (this.alignRefPoint) {
                this.doAlignRefPoint();
            } else {
                this.runScoreLabel.string = CommonTool.coinFormat(p_score, 0, false, false);
            }
        }
    }

    /** 取得現在的跑分分數 */
    public getNowScore(): number {
        return Number(this.getCorrectNum(this.runScoreLabel.string));
    }

    public isRunning(): boolean {
        return this.targetScore != this.nowScore;
    }

    /** 創建一個跑分的Label */
    private createRunScoreLabel(): void {
        let _obj = new cc.Node("RunScoreLabel");
        this.runScoreLabel = _obj.addComponent(cc.Label);

        this.runScoreLabel.node.setParent(this.label.node);
        this.runScoreLabel.string = this.label.string;
        this.runScoreLabel.horizontalAlign = this.label.horizontalAlign;
        this.runScoreLabel.verticalAlign = this.label.verticalAlign;
        this.runScoreLabel.fontSize = this.label.fontSize;
        this.runScoreLabel.lineHeight = this.label.lineHeight;
        this.runScoreLabel.overflow = this.label.overflow;
        this.runScoreLabel.enableWrapText = this.label.enableWrapText;
        this.runScoreLabel.font = this.label.font;
        this.runScoreLabel.fontFamily = this.label.fontFamily;
        this.runScoreLabel.enableBold = this.label.enableBold;
        this.runScoreLabel.enableItalic = this.label.enableItalic;
        this.runScoreLabel.enableUnderline = this.label.enableUnderline;
        this.runScoreLabel.cacheMode = this.label.cacheMode;
        this.runScoreLabel.useSystemFont = this.label.useSystemFont;
        this.runScoreLabel.spacingX = this.label.spacingX;

        this.runScoreLabel.node.angle = this.label.node.angle;
        this.runScoreLabel.node.scale = this.label.node.scale;
        this.runScoreLabel.node.anchorX = this.label.node.anchorX;
        this.runScoreLabel.node.anchorY = this.label.node.anchorY;
        this.runScoreLabel.node.setPosition(cc.v2(0, 0));
        this.runScoreLabel.node.setContentSize(this.label.node.getContentSize());
        this.runScoreLabel.node.color = this.label.node.color;
        this.runScoreLabel.node.opacity = this.label.node.opacity;
        this.runScoreLabel.node.group = this.label.node.group;
        this.runScoreLabel.node.is3DNode = this.label.node.is3DNode;

        let outline: cc.LabelOutline = this.label.getComponent(cc.LabelOutline);
        if (outline) {
            let scoreOutline: cc.LabelOutline = _obj.addComponent(cc.LabelOutline);
            scoreOutline.width = outline.width;
            scoreOutline.color = outline.color;
        }
    }

    /** 跑分效果 依速度*/
    private runScoreBySpeed(p_dt: number): void {
        p_dt = this.dtRandom(p_dt);

        let _gap = this.targetScore - this.nowScore;
        let _moveScore = this.runSpeed * p_dt;

        if (this.hasDecimalPoint) {
            if (_moveScore < Math.pow(0.1, this.decimalPointCount)) {
                _moveScore = Math.pow(0.1, this.decimalPointCount);
            }

            if (_moveScore) {
                _moveScore = Number(_moveScore.toFixed(this.decimalPointCount));
            }
        } else {
            if (_moveScore < Math.pow(0.1, 2)) {
                _moveScore = Math.pow(0.1, 2);
            }

            _moveScore = Number(_moveScore.toFixed(this.decimalPointCount));
        }

        if (_gap > 0) {
            this.nowScore += _moveScore;

            if (this.nowScore > this.targetScore) {
                this.nowScore = this.targetScore;
            }
        } else {
            this.nowScore -= _moveScore;

            if (this.nowScore < this.targetScore) {
                this.nowScore = this.targetScore;
            }
        }

        if (this.hasDecimalPoint) {
            let _newScore = this.nowScore;
            this.runScoreLabel.string = CommonTool.coinFormat(_newScore, this.decimalPointCount, false, false, this.decimalPointCount);
        } else {
            this.runScoreLabel.string = CommonTool.coinFormat(this.nowScore, 0, false, false);
        }
    }

    /** 隨機dt 避免特殊情況下分數會一致 */
    private dtRandom(p_dt: number): number {
        let _random: number = -6 + this.random(0 - this.dtOffset, 12 - this.dtOffset);
        this.dtOffset += _random;
        p_dt -= _random * 0.001;

        return p_dt;
    }

    /** 跑分效果 依時間 */
    private runScoreByTime(p_dt: number) {
        p_dt = this.dtRandom(p_dt);

        this.tempRunTime += p_dt;
        let _gap: number = this.targetScore - this.nowScore;

        let _targetScore: number = this.nowScore + (_gap * this.tempRunTime) / this.runTime;

        if (this.hasDecimalPoint) {
            _targetScore = Number(_targetScore.toFixed(this.decimalPointCount));
        } else {
            _targetScore = Math.round(_targetScore);
        }

        if (this.tempRunTime / this.runTime > 1) {
            _targetScore = this.targetScore;
            this.nowScore = this.targetScore;
        }

        if (this.hasDecimalPoint) {
            this.runScoreLabel.string = CommonTool.coinFormat(_targetScore, this.decimalPointCount, false, false, this.decimalPointCount);
        } else {
            this.runScoreLabel.string = CommonTool.coinFormat(_targetScore, 0, false, false);
        }
    }

    /** 在完成時對齊參考lab的小數位數 */
    private doAlignRefPoint(): void {
        this.isDone = true;

        let slice = this.label.string.split(".");
        let count = 0;

        // 取得小數位數並設定
        if (slice.length == 2) {
            count = slice[1].length;
        }

        this.runScoreLabel.string = CommonTool.coinFormat(this.nowScore, count, false, false, count);
    }

    /** 取得隨機數 */
    private random(lower: number, upper: number): number {
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }
}

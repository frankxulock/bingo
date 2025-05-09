const { ccclass, property } = cc._decorator;

export enum PopupAnimationType {
    None,
    Bounce,         // 彈簧效果（Bounce）
    SlideFromLeft,  // 從左側進場
    SlideFromRight, // 從右側進場
    SlideFromBottom,// 從下方進場
    ScaleIn,        // 縮小並放大（從小到大）
    FlipVertical,   // 上下翻轉動畫
}

@ccclass
export default class PopupAnimationComponent extends cc.Component {
    @property({ type: cc.Node, tooltip: "動畫的目標節點，預設為 this.node" })
    public target: cc.Node = null;

    private get Obj(): cc.Node {
        return this.target || this.node;
    }

    public playEnter(type: PopupAnimationType): void {
        const obj = this.Obj;
        obj.stopAllActions();

        switch (type) {
            case PopupAnimationType.Bounce:
                obj.scale = 0.5;
                obj.runAction(cc.sequence(
                    cc.scaleTo(0.3, 1.2).easing(cc.easeBounceOut()),
                    cc.scaleTo(0.1, 1)
                ));
                break;

            case PopupAnimationType.SlideFromLeft:
                obj.x = -cc.winSize.width;
                obj.runAction(cc.moveTo(0.3, cc.v2(0, obj.y)).easing(cc.easeCubicActionOut()));
                break;

            case PopupAnimationType.SlideFromRight:
                obj.x = cc.winSize.width;
                obj.runAction(cc.moveTo(0.3, cc.v2(0, obj.y)).easing(cc.easeCubicActionOut()));
                console.log(cc.v2(0, obj.y));
                break;

            case PopupAnimationType.SlideFromBottom:
                obj.y = -cc.winSize.height;
                obj.runAction(cc.moveTo(0.3, cc.v2(obj.x, 0)).easing(cc.easeCubicActionOut()));
                break;

            case PopupAnimationType.ScaleIn:
                obj.scale = 0;
                obj.runAction(cc.scaleTo(0.3, 1).easing(cc.easeBackOut()));
                break;

            case PopupAnimationType.FlipVertical:
                obj.scaleY = 0;
                obj.runAction(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()));
                break;

            case PopupAnimationType.None:
            default:
                break;
        }
    }

    public playExit(type: PopupAnimationType, onFinish?: () => void): void {
        const obj = this.Obj;
        obj.stopAllActions();

        let action: cc.ActionInterval;

        switch (type) {
            case PopupAnimationType.Bounce:
                action = cc.scaleTo(0.2, 0).easing(cc.easeBackIn());
                break;

            case PopupAnimationType.SlideFromLeft:
                action = cc.moveTo(0.3, cc.v2(-cc.winSize.width, obj.y)).easing(cc.easeCubicActionIn());
                break;

            case PopupAnimationType.SlideFromRight:
                action = cc.moveTo(0.3, cc.v2(cc.winSize.width, obj.y)).easing(cc.easeCubicActionIn());
                break;

            case PopupAnimationType.SlideFromBottom:
                action = cc.moveTo(0.3, cc.v2(obj.x, -cc.winSize.height)).easing(cc.easeCubicActionIn());
                break;

            case PopupAnimationType.ScaleIn:
                action = cc.scaleTo(0.2, 0).easing(cc.easeBackIn());
                break;

            case PopupAnimationType.FlipVertical:
                action = cc.scaleTo(0.2, 1, 0).easing(cc.easeBackIn());
                break;

            case PopupAnimationType.None:
            default:
                if (onFinish) onFinish();
                return;
        }

        obj.runAction(cc.sequence(
            action,
            cc.callFunc(() => {
                if (onFinish) onFinish();
            })
        ));
    }
}


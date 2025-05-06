export default class UIAnimation {
    /** 彈窗開啟動畫 */
    static show(node: cc.Node, type: "scale" | "fade" | "slide" = "scale", callback?: Function) {
        node.stopAllActions();
        node.opacity = 0;
        node.scale = 0.5;
        node.y = 0;

        let action: cc.Action;

        switch (type) {
            case "scale":
                action = cc.spawn(
                    cc.fadeIn(0.3),
                    cc.scaleTo(0.3, 1).easing(cc.easeBackOut())
                );
                break;
            case "fade":
                action = cc.fadeIn(0.3);
                break;
            case "slide":
                node.y = -800;
                action = cc.spawn(
                    cc.fadeIn(0.3),
                    cc.moveTo(0.3, cc.v2(0, 0)).easing(cc.easeBackOut())
                );
                break;
        }

        node.runAction(cc.sequence(action as cc.FiniteTimeAction, cc.callFunc(() => {
            if (callback) callback();
        })));
    }

    /** 彈窗關閉動畫 */
    static hide(node: cc.Node, type: "scale" | "fade" | "slide" = "scale", callback?: Function) {
        node.stopAllActions();

        let action: cc.Action;

        switch (type) {
            case "scale":
                action = cc.spawn(
                    cc.fadeOut(0.2),
                    cc.scaleTo(0.2, 0.5).easing(cc.easeIn(2.0))
                );
                break;
            case "fade":
                action = cc.fadeOut(0.2);
                break;
            case "slide":
                action = cc.spawn(
                    cc.fadeOut(0.2),
                    cc.moveTo(0.2, cc.v2(0, -800)).easing(cc.easeIn(2.0))
                );
                break;
        }

        node.runAction(cc.sequence(action as cc.FiniteTimeAction, cc.callFunc(() => {
            if (callback) callback();
        })));
    }
}

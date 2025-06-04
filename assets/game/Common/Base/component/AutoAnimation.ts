const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoAnimation extends cc.Component {
    @property({ tooltip: "播放的動畫名稱（留空則播放 default）" })
    animationName: string = "";

    @property({ tooltip: "動畫播放結束後延遲幾秒關閉" })
    delay: number = 1;

    @property({ type: cc.Animation, visible: true,tooltip: "動畫組件" })
    private anim : cc.Animation = null;

    onEnable() {
        if (!this.anim) {
            cc.warn("AutoAnimation: 找不到 Animation 組件  名稱 : ", this.name);
            return;
        }

        // 播放動畫
        if (this.animationName) {
            this.anim.play(this.animationName);
        } else {
            this.anim.play();
        }

        // 註冊動畫結束事件
        this.anim.once('finished', () => {
            this.scheduleOnce(() => {
                this.node.active = false;
            }, this.delay);
        });
    }
}

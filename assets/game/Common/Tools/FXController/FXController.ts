const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("自訂工具/UI/FX控制器")
export default class FXController extends cc.Component {
    @property([cc.ParticleSystem])
    private particle2D: cc.ParticleSystem[] = [];

    @property([cc.ParticleSystem3D])
    private particle3D: cc.ParticleSystem3D[] = [];

    @property([cc.Animation])
    private animations: cc.Animation[] = [];

    @property([sp.Skeleton])
    private spines: sp.Skeleton[] = [];

    @property({ visible: false })
    private _combine: boolean = false;
    @property({ type: cc.Boolean, tooltip: "獲取組建" })
    get combine() { return this._combine; }
    set combine(value) { this.combineProperty(); }

    /** 播放 */
    public play() {
        this.node.active = true;

        this.stopAllParticle2D();
        this.playAllParticle2D();

        this.stopAllParticle3D();
        this.playAllParticle3D();

        this.stopAllAnimation();
        this.playAllAnimation();

        this.stopAllSpine();
        this.playAllSpine();
    }

    /** 播放 animation(支援單獨播放，若單獨播放會回傳 AnimationState) */
    public playAnimation(animationName?: string): cc.AnimationState {
        this.node.active = true;

        this.stopAllParticle2D();
        this.playAllParticle2D();

        this.stopAllParticle3D();
        this.playAllParticle3D();

        this.stopAllSpine();

        this.stopAllAnimation();

        if (animationName) {
            return this.node.getComponent(cc.Animation).play(animationName);
        } else {
            this.playAllAnimation();
        }
    }

    /** 停止 */
    public stop() {
        this.node.active = false;
    }

    /** 播放所有的Particle2D */
    private playAllParticle2D() {
        for (let i = 0; i < this.particle2D.length; i++) {
            this.particle2D[i].node.active && this.particle2D[i].resetSystem();
        }
    }

    /** 停止所有的Particle2D */
    private stopAllParticle2D() {
        for (let i = 0; i < this.particle2D.length; i++) {
            this.particle2D[i].node.active && this.particle2D[i].stopSystem();
        }
    }

    /** 播放所有的Particle3D */
    private playAllParticle3D() {
        for (let i = 0; i < this.particle3D.length; i++) {
            this.particle3D[i].node.active && this.particle3D[i].play();
        }
    }

    /** 停止所有的Particle3D */
    private stopAllParticle3D() {
        for (let i = 0; i < this.particle3D.length; i++) {
            this.particle3D[i].node.active && this.particle3D[i].stop();
        }
    }

    /** 播放所有的Animation */
    private playAllAnimation() {
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].play();
        }
    }

    /** 停止所有的Animation */
    private stopAllAnimation() {
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].stop();
        }
    }
    /** 停止所有的Spine */
    private stopAllSpine() {
        for (let i = 0; i < this.spines.length; i++) {
            this.spines[i].node.active = false;
        }
    }

    /** 播放所有的Spine */
    private playAllSpine() {
        for (let i = 0; i < this.spines.length; i++) {
            this.spines[i].node.active = true;
            let _animationName: string = this.spines[i].defaultAnimation;
            let _loop: boolean = this.spines[i].loop;
            this.spines[i].setAnimation(0, _animationName, _loop);
        }
    }

    /** 連結property */
    private combineProperty() {
        this.particle2D = this.node.getComponentsInChildren(cc.ParticleSystem);
        this.particle3D = this.node.getComponentsInChildren(cc.ParticleSystem3D).filter((obj) => !obj.loop);
        this.animations = this.node.getComponentsInChildren(cc.Animation);
        this.spines = this.node.getComponentsInChildren(sp.Skeleton);
    }
}

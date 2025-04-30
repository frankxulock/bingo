declare namespace cc {
    export interface Node {
        _worldMatrix: cc.mat4;
        _hitTest: (point: cc.Vec2) => void;

        _calculWorldMatrix(): void;
        /* #region <Custom 自定義> */
        setAsFirstSibling(): void;
        setAsLastSibling(): void;
        /* #endregion <Custom 自定義> */
    }

    export interface Component {
        _vertsDirty: boolean;
        _materials: cc.Material[];

        _activateMaterial();
    }

    export interface Game {
        _renderContext: WebGLRenderingContext;
    }

    export interface Sprite {
        m_segLen: number;
        m_pointMass: number;
        _assembler: MassSpringAssembler;

        setVertsDirty(): void;
        _updateColor(): void;

        /* #region <Custom 自定義> */
        preserveSize(size: cc.Vec2): void;
        setNativeSize(): void;
        /* #endregion <Custom 自定義> */
    }

    export interface SpriteFrame {
        _uuid: string;
    }

    export interface Color {
        _val: Uint32Array;
    }

    export interface Director extends EventTarget {
        calculateDeltaTime(now: number): void;
        kSpeed: number;
        _lastUpdate: number;
    }

    export interface RenderComponent extends Component {
        setVertsDirty(): void;
        _assembler: Assembler;
    }

    export interface ContainerStrategy {
        _setupStyle(view: View, w: number, h: number): void;
    }

    export const internal: { inputManager: any; eventManager: any };
}

declare namespace cc.renderer {
    export let _handle: ModelBatcher;
}

declare namespace sp {
    export interface SkeletonData extends cc.Asset {
        _uuid: string;
    }
}

declare namespace cc.gfx {
    export function gfx(): void;

    class VertexFormat {
        constructor(attributes: VertexAttribute[]);
    }
    interface VertexAttribute {
        name: string;
        type: number;
        num: number;
        normalize?: boolean;
    }
    const ATTR_POSITION: string;
    const ATTR_UV0: string;
    const ATTR_COLOR: string;
    const ATTR_TYPE_FLOAT32: number;
    const ATTR_TYPE_UINT8: number;

    const RB_FMT_S8: number;
}

declare interface Window {
    loginData: any
}

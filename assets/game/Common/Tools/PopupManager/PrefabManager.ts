const { ccclass, property } = cc._decorator;

@ccclass
export default class PrefabManager extends cc.Component {
    public static instance: PrefabManager = null;

    @property({ type: [cc.Prefab] })
    public prefabList: cc.Prefab[] = [];

    private prefabMap: Map<string, cc.Prefab> = new Map();

    onLoad() {
        if (PrefabManager.instance) {
            this.destroy();
            return;
        }
        PrefabManager.instance = this;

        this.prefabList.forEach(prefab => {
            if (prefab) this.prefabMap.set(prefab.name, prefab);
        });
    }

    public getPrefab(name: string): cc.Prefab {
        return this.prefabMap.get(name);
    }

    public async loadPrefabAsync(path: string): Promise<cc.Prefab> {
        return new Promise((resolve, reject) => {
            cc.resources.load(path, cc.Prefab, (err, prefab : cc.Prefab) => {
                if (err) return reject(err);
                this.prefabMap.set(prefab.name, prefab);
                resolve(prefab);
            });
        });
    }
}

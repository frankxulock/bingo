import BaseSingletonComponent from "../Base/BaseSingletonComponent";
import { PopupName, PopupPrefabPath } from "./PopupConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PrefabManager extends BaseSingletonComponent {
    public static instance: PrefabManager = null;
    private prefabMap: Map<string, cc.Prefab> = new Map();

    public static getInstance(): PrefabManager {
        return this._getInstance(PrefabManager);
    }

    public getPrefab(name: string): cc.Prefab {
        return this.prefabMap.get(name);
    }

    public async getOrLoadPrefab(name: PopupName): Promise<cc.Prefab> {
        if (this.prefabMap.has(name)) {
            return this.prefabMap.get(name);
        }

        const path = PopupPrefabPath[name];
        if (!path) {
            throw new Error(`找不到 ${name} 的 prefab 路徑`);
        }

        const prefab = await this.loadPrefabAsync(path);
        this.prefabMap.set(name, prefab);
        return prefab;
    }

    private loadPrefabAsync(path: string): Promise<cc.Prefab> {
        return new Promise((resolve, reject) => {
            cc.resources.load<cc.Prefab>(path, (err, prefab) => {
                if (err || !prefab) {
                    return reject(err);
                }
                resolve(prefab);
            });
        });
    }
}

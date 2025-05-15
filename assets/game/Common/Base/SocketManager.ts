import BaseDataManager from "../Tools/Base/BaseDataManager";
import Singleton from "../Tools/Base/Singleton";

const { ccclass } = cc._decorator;
@ccclass
export default class SocketManager extends Singleton {
  
    public init() : void {
        const config = (window as any).GameConfig;
        if(config) {
            BaseDataManager.http = config.HTTP;
            BaseDataManager.serverHost = config.SERVERHOST;
        }else {
            cc.error("沒有配置 GameConfig");
        }
    }
}
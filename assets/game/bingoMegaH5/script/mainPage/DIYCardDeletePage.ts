import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import { CommonTool } from "../../../Common/Tools/CommonTool";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";
import { HttpServer } from "../HttpServer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DIYCardDeletePage extends cc.Component implements IWindow {

    private data;

    open(data?: any): void {
        this.data = data;
    }
    close?(): void {
        PopupManager.closePopup(PopupName.DIYCardDeletePage);
    }
    OnOK() {
        CommonTool.executeWithLock(this, () => {  
            // 請求刪除卡片
            HttpServer.DIYDelete(this.data.id)
            .then(results => {
                EventManager.getInstance().emit(
                    GameStateUpdate.StateUpdate_DeleteDIYCard,
                    this.data.data
                );
                HttpServer.DIYCardList()
                .then(results => { 
                    
                });
            });
            // 關閉頁面
            this.close();
        }, 0.5, "DIYCardDeletePage_OK");
    }
    OnCancel() {
        CommonTool.executeWithLock(this, () => {  
            this.close();
        }, 0.5, "DIYCardDeletePage_Cancel");    
    }
}

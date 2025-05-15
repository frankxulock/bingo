import ChatItem from "../../../common/Base/component/ChatItem";
import EventManager, { GameStateUpdate } from "../../../common/Tools/Base/EventManager";
import { IWindow } from "../../../common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../common/Tools/PopupSystem/PopupManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatPage extends cc.Component implements IWindow {

    @property(cc.ScrollView)
    ScrollView_chatContent: cc.ScrollView = null!;
    @property(cc.EditBox)
    EditBox_Input: cc.EditBox = null!;
    @property(cc.Button)
    Btn_send: cc.Button = null!;
    @property(cc.Prefab)
    chatItem: cc.Prefab = null!;

    protected onLoad(): void {
        EventManager.getInstance().on(GameStateUpdate.StateUpdate_ReceiveChatMessage, this.displayMessage, this);
    }

    protected onDestroy(): void {
         EventManager.getInstance().off(GameStateUpdate.StateUpdate_ReceiveChatMessage, this.displayMessage, this);
    }

    private data : any = null;
    open(data: any): void {
        if(data == null)
            return;

        this.data = data;
        this.ScrollView_chatContent.content.removeAllChildren();
        this.data.forEach((item) => {
            this.displayMessage(item);
        })
    }
    close(): void {
        PopupManager.closePopup(PopupName.ChatPage);
    }

    // 發送消息
    onSendMessage() {
        const message = this.EditBox_Input.string.trim();
        if (message.length > 0) {
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SendChatMessage, this.EditBox_Input.string);
            this.EditBox_Input.string = ''; // 清空輸入框
        }
    }

    // 顯示消息
    displayMessage(data: any) {
        const messageNode = cc.instantiate(this.chatItem) as cc.Node;
        messageNode.getComponent(ChatItem)?.setData(data);
        this.ScrollView_chatContent.content.addChild(messageNode);
        // 滾動到最新消息
        this.ScrollView_chatContent.scrollToBottom();
    }
}

import ChatItem from "../../../Common/Base/component/ChatItem";
import CustomInputBox from "../../../Common/Base/component/CustomEditBox";
import EventManager, { GameStateUpdate } from "../../../Common/Tools/Base/EventManager";
import { IWindow } from "../../../Common/Tools/PopupSystem/IWindow";
import { PopupName } from "../../../Common/Tools/PopupSystem/PopupConfig";
import PopupManager from "../../../Common/Tools/PopupSystem/PopupManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatPage extends cc.Component implements IWindow {

    @property(cc.ScrollView)
    ScrollView_chatContent: cc.ScrollView = null!;
    @property(CustomInputBox)
    EditBox_Input: CustomInputBox = null!;
    @property(cc.Button)
    Btn_send: cc.Button = null!;
    @property(cc.Prefab)
    chatItem: cc.Prefab = null!;

    @property(cc.Node)
    Node_giftGiving: cc.Node = null!;
    private giftAction : boolean = false;

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
        });
        this.giftAction = false;
        this.Node_giftGiving.active = this.giftAction;
    }
    close(): void {
        PopupManager.closePopup(PopupName.ChatPage);
    }

    // 發送消息
    onSendMessage() {
        const message = this.EditBox_Input.getText();
        if (message.length > 0) {
            EventManager.getInstance().emit(GameStateUpdate.StateUpdate_SendChatMessage, message);
            this.EditBox_Input.setText(''); // 清空輸入框
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

    OnGiftAction() {
        this.giftAction = !this.giftAction;
        this.Node_giftGiving.active = this.giftAction;
    }
}

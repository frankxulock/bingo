import { CommonTool } from "../../../Common/Tools/CommonTool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChatItem extends cc.Component {

    /** 聊天者名稱的 Label 元件 */
    @property({ type: cc.Label, visible: true })
    private Label_name: cc.Label = null;

    /** 聊天內容的 Label 元件 */
    @property({ type: cc.Label, visible: true })
    private Label_content: cc.Label = null;

    /**
     * 設定聊天項目的資料，更新顯示的名稱與內容
     * @param data 傳入的聊天資料，預期至少包含 name 與 content 屬性
     */
    setData(data: { name?: string; content?: string } | null) {
        if (!data) {
            cc.warn("ChatItem.setData: 傳入資料為空，忽略設定");
            return;
        }

        // 使用 CommonTool 來設定 Label 文字，避免直接操作 Label.string
        CommonTool.setLabel(this.Label_name, data.name);
        CommonTool.setLabel(this.Label_content, data.content);
    }
}

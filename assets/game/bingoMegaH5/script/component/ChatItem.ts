import { CommonTool } from "../../../Common/Tools/CommonTool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatItem extends cc.Component {

    @property({ type: cc.Label, visible: true })
    private Label_name : cc.Label = null;
    @property({ type: cc.Label, visible: true })
    private Label_content : cc.Label = null;

    private data : any = null;

    setData(data) {
        if(data == null)
            return;

        this.data = data;
        CommonTool.setLabel(this.Label_name, data.name);
        CommonTool.setLabel(this.Label_content, data.content);
    }
}

import BaseDataManager from '../../Base/BaseDataManager';
import LocalizationManager from '../../Localization/LocalizationManager';
import { sendGet, sendPost } from '../http/Http';

export class HttpSender {
    protected isTokenFailed: boolean = false;

    async sendGet<T>(apiUrl: string, queryParam?: {}): Promise<T> {
        cc.log("%c %s", "background: Gray; color: White;", `Http 發送 ${apiUrl} `, queryParam || {});
        const response = await sendGet(
            `${BaseDataManager.http}${BaseDataManager.serverHost}${apiUrl}`,
            {
                'x-session-token': BaseDataManager.token,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'x-lang': LocalizationManager.language
            },
            queryParam,
        )

        if(response && response.status === 401) {
            console.warn("http sendGet ", apiUrl, " code: ", 401);
            return <any>{success: false, msg: "tokenFailed", code: 401};
        }

        if (response && response.status === 400) {
            const json = await response.json();
            cc.log("%c %s", "background: Gray; color: White;", `Http 回應 ${apiUrl} `, json);
            return <any>{success: false, msg: json.msg, code: 400};
        }

        if (response && response.status === 200) {
            const json = await response.json();
            cc.log("%c %s", "background: Gray; color: White;", `Http 回應 ${apiUrl} `, json);
            return <T>json;
        }

        if(response && response.status) {
            console.warn("http sendGet ", apiUrl, " code: ", response.status);
            return <any>{success: false, msg: 'fail', code: response.status};
        } else {
            console.warn("http sendGet ", apiUrl, " code: ", 318);
            return <any>{success: false, msg: 'fail', code: 318}
        }
    }

    async sendPost<T>(apiUrl: string, bodyData?: FormData | object): Promise<T> {
        cc.log("%c %s", "background: Gray; color: White;", `Http 發送 ${apiUrl} `, bodyData || {});
        const traceId: string = new Date().getTime().toString().slice(-8);

        // 建立 request options
        let headers = { ...window.url._commonHeaders };
        let body: BodyInit;

        if(bodyData instanceof FormData) {
            body = bodyData;
        }else {
            // 是 JSON 格式
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(bodyData || {});
        }

        const response = await sendPost(
            `${BaseDataManager.http}${BaseDataManager.serverHost}${apiUrl}`,
            window.url._commonHeaders,
            body,
        )

        if(response && response.status === 401) {
            console.warn("http sendPost ", apiUrl, " code: ", 401);
            return <any>{success: false, msg: "tokenFailed", code: 401};
        }

        if (response && response.status === 400) {
            const json = await response.json();
            cc.log("%c %s", "background: Gray; color: White;", `Http 回應 ${apiUrl} `, json);
            return <any>{success: false, msg: json.msg, code: 400};
        }

        if (response && response.status === 200) {
            const json = await response.json();
            cc.log("%c %s", "background: Gray; color: White;", `Http 回應 ${apiUrl} `, json);
            return <T>json;
        }

        if(response && response.status) {
            console.warn("http sendPost ", apiUrl, " code: ", response.status);
            return <any>{success: false, msg: 'fail', code: response.status};
        } else {
            console.warn("http sendPost ", apiUrl, " code: ", 318);
            return <any>{success: false, msg: 'fail', code: 318}
        }
    }
}

export const httpSender = new HttpSender()

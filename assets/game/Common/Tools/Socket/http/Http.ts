

export async function sendGet(url: string, headers?: {}, queryParam?: {}): Promise<Response> {
    // 處理 get 查詢參數
    let query = ''
    if (queryParam) {
        let temp = ''

        const queryParamkeys = Object.keys(queryParam)
        for (let i = 0; i < queryParamkeys.length; ++i) {
            const key = queryParamkeys[i]
            // @ts-ignore
            temp += `${key}=${queryParam[key]}`

            if (i < queryParamkeys.length - 1) {
                temp += '&'
            }
        }

        if (temp) {
            query = `?${temp}`
        }
    }

    try {
        const completeUrl = `${url}${query}`
        // log(`send http GET: ${completeUrl}`)
        const response = await fetch(completeUrl, {
            headers: headers,
            method: 'GET',
            cache: 'no-cache',
        })

        return response
    } catch (err) {
        cc.error(err)
    }
    return undefined
}

export async function sendPost(url: string, headers?: {}, bodyData?: any) {
    try {
        const res = await fetch(`${url}`, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers,
            body: bodyData
        }
        );

        return res;
    } catch (err) {
        cc.error(err)
    }
    return null;
}
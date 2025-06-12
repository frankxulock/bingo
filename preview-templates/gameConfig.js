const url = {
    /**
     * 主機映射配置表 - 統一管理 HTTP API 和 WebSocket 連接
     * 支援本地開發、測試環境和生產環境的自動切換
     */
    HOST_MAPPING: {
        // 本地開發環境
        'localhost': { 
            api: 'localhost:3000/proxy/', 
            ws: 'wss://bg-nats.vipsroom.net/' 
        },
        '127.0.0.1': { 
            api: 'localhost:3000/proxy/', 
            ws: 'wss://bg-nats.vipsroom.net/' 
        },
        // 開發測試環境 - devcocos 特殊處理
        'devcocos.okbingos.com': { 
            api: 'devcocos.okbingos.com/', 
            ws: 'wss://devnats.okbingos.com/' 
        },
        // 測試環境 - testpc 特殊處理
        'testpc.okbingos.com': { 
            api: 'testpc.okbingos.com/', 
            ws: 'wss://bg-nats.vipsroom.net/' 
        },
        // 擴展示例：可以輕鬆添加更多環境
        // 'prod.example.com': { 
        //     api: 'api.example.com/', 
        //     ws: 'wss://ws.example.com/' 
        // },
    },

    /**
     * 統一主機解析方法 - 自動檢測當前環境並返回對應的服務器配置
     * @param {string} type - 'api' 或 'ws'，指定要獲取的服務類型
     * @returns {string} 對應的服務器地址
     */
    _resolveHost(type = 'api') {
        const currentHost = window.location.hostname;
        const currentUrl = window.location.href;
        
        // 直接匹配主機名
        if (this.HOST_MAPPING[currentHost]) {
            return this.HOST_MAPPING[currentHost][type];
        }
        
        // 模糊匹配 URL 中包含的主機名
        for (const [hostKey, config] of Object.entries(this.HOST_MAPPING)) {
            if (currentUrl.includes(hostKey) || currentHost.includes(hostKey)) {
                return config[type];
            }
        }
        
        // 預設值：未匹配時的自動生成規則
        if (type === 'ws') {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            return `${protocol}//${currentHost}/`;
        }
        return `${currentHost}/`;
    },

    /** HTTP 協議前綴 - 自動檢測當前網頁協議 */
    get HTTP() {
        return window.location.protocol + "//";
    },
    
    /** API 服務器主機 - 自動解析 HTTP API 地址 */
    get SERVERHOST() {
        return this._resolveHost('api');
    },

    /** WebSocket 服務器主機 - 自動解析 WebSocket 地址 */
    get WSHOST() {
        return this._resolveHost('ws');
    },

    // 目前遊戲代碼（可切換成不同遊戲）
    MEGA: "BGM",
    RUSH: "BGR",
  
    // API 路徑統一管理，方便擴充與維護
    PATHS: {
      ID: "gameApi/api/front/game/round/id",
      CURRENCY: "mer/api/v1/merchant/get/currency",
      INFO: "userApi/api/user/info",
      JACKPOT: "gameApi/api/front/game/jackpot",
      LIST: "gameApi/api/front/game/patten/list",
      ONLINE: "gameApi/api/front/game/online",
      MAINTAINSTATE: "mer/api/v1/game/getMaintainStatus",
      INFOLOCK: "mer/api/v1/player/lock/get",
      VERSION: "gameApi/api/front/game/version",
      SETTING: "gameApi/api/front/game/setting/list",
      VIDEO: "gameApi/api/front/game/video/list",
      CARDLIST: "orderApi/api/order/list/current",
      CREATECARD: "orderApi/api/order/create",
      DIYCARD: "gameApi/api/front/game/card/list",
      DIYCOUNT: "gameApi/api/front/game/card/count",
      DIYCREATE: "gameApi/api/front/game/card/create",
      DIYUPDATE: "gameApi/api/front/game/card/update",
      DIYDELETE: "gameApi/api/front/game/card/delete",
      INFOHISTORY: "orderApi/api/order/list/history",
    },
  
    /** 商戶ID字串，getter 拆成 key/value */
    get MERCHANTID() {
      return { key: "merchantId", value: "692" };
    },
  
    /** 取得當前遊戲代碼 */
    getGame() {
      return this.MEGA;
    },
  
    /**
     * 組合完整的 API URL（含 base + path + 查詢參數）
     * @param {string} path API 路徑
     * @param {Object} [query={}] 查詢參數物件
     * @returns {string} 完整 URL 字串
     */
    buildUrl(path, query = {}) {
      // 確保 base url 最後有斜線，path 不以斜線開頭
      const base = this.HTTP + this.SERVERHOST.replace(/\/+$/, "") + "/";
      const cleanPath = path.replace(/^\/+/, "");
      const url = new URL(cleanPath, base);
  
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          url.searchParams.append(k, v);
        }
      });
  
      return url.toString();
    },
  
    // 取得各 API URL
    getIDUrl() {
      return this.buildUrl(this.PATHS.ID, { game_code: this.getGame() });
    },
    getCURRENCYUrl() {
      return this.buildUrl(this.PATHS.CURRENCY);
    },
    getINFOUrl() {
      return this.buildUrl(this.PATHS.INFO);
    },
    getJACKPOTUrl() {
      return this.buildUrl(this.PATHS.JACKPOT, { game_code: this.getGame() });
    },
    getLISTUrl() {
      return this.buildUrl(this.PATHS.LIST, { game_code: this.getGame() });
    },
    getONLINEUrl() {
      const { key, value } = this.MERCHANTID;
      return this.buildUrl(this.PATHS.ONLINE, { [key]: value });
    },
    getMAINTAINSTATEUrl() {
      return this.buildUrl(this.PATHS.MAINTAINSTATE);
    },
    getINFOLOCK() {
      return this.buildUrl(this.PATHS.INFOLOCK);
    },
    getVERSION() {
      return this.buildUrl(this.PATHS.VERSION);
    },
    getSETTING() {
      return this.buildUrl(this.PATHS.SETTING, { game_code: this.getGame() });
    },
    getVIDEO() {
      return this.buildUrl(this.PATHS.VIDEO, { game_code: this.getGame() });
    },
    getCARDLIST() {
      return this.buildUrl(this.PATHS.CARDLIST);
    },
    getCreateCard() {
      return this.buildUrl(this.PATHS.CREATECARD);
    },
    getDIYCard() {
      return this.buildUrl(this.PATHS.DIYCARD);
    },
    getDIYCount() {
      return this.buildUrl(this.PATHS.DIYCOUNT);
    },
    getDIYCreate() {
      return this.buildUrl(this.PATHS.DIYCREATE);
    },
    getDIYUpdate(card_detail, card_id) {
      return this.buildUrl(this.PATHS.DIYUPDATE, {card_detail: card_detail, card_id: card_id});
    },
    getDIYDelete(card_id) {
      return this.buildUrl(this.PATHS.DIYDELETE, {card_id: card_id});
    },
    getInfoHistory() {
      return this.buildUrl(this.PATHS.INFOHISTORY);
    },

    /** 共用 token 與驗證 Header 參數 */
    generateAuthHeaders() {
      const token = window.decryptedTokenData.token;
      const merchantCode = window.decryptedTokenData.code;

      let currentTime = new Date().getTime();; // 留下給 Current_Time 與 Signature 用
      let nanoid2 = (e = 21) =>
      crypto.getRandomValues(new Uint8Array(e)).reduce((acc, t) => {
        t &= 63;
        return acc += t < 36
          ? t.toString(36)
          : t < 62
          ? (t - 26).toString(36).toUpperCase()
          : t > 62
          ? "-"
          : "_";
      }, "");
      let signatureNonce = nanoid2();
      let signatureRaw = `${window.decryptedTokenData.code}${signatureNonce}mer-api-test${currentTime}`;
      let signature = md5(signatureRaw);

      // console.log('token => ', token);
      // console.log('Signature_Nonce => ', signatureNonce);
      // console.log("Signature => ", signature)
      return {
        Authorization: `Bearer ${token}`,
        Current_Time: currentTime,
        Signature_Nonce: signatureNonce,
        Signature: signature,
        Merchant_Code: merchantCode,
      };
    },

    /**
     * 取得自訂的 fetch 請求 headers（GET）
     * @returns {object} fetch 的設定物件
     */
    getHeaders() {
      return {
        method: "GET",
        headers: { ...this.generateAuthHeaders() },
      };
    },
  
    /**
     * 取得自訂的 fetch 請求 headers（POST）
     * @param {Object} [body={}] 要送出的 JSON 物件
     * @returns {object} fetch 的設定物件
     */
    getHeaders_POST(body = {}) {
      return {
        method: "POST",
        headers: {
          ...this.generateAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      };
    },
  };
const DataFetcher = (() => {
  const DEFAULT_MAX_RETRIES = 3;

  function validateData(data) {
    return data || null;
  }

  async function fetchSingle({ key, url, options}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`Network error on ${key}`);
      const json = await response.json();
      // 檢查回應是否成功 (code === 0 或 code === 10000)
      if (json.code !== 0 && json.code !== 10000) {
        throw new Error(`API error on ${key}: ${json.code}  data ${json.data} message : ${json.message}`);
      }
      const result = { 
        key, 
        data: json.data,
        code: json.code  // 加入 code 資訊
      };
      return result;
    } catch (err) {
      throw err;
    }
  }
  
  function fetchAll({
    endpoints = [],
    target = {},
    onComplete = () => {},
    onError = () => {},
    maxRetries = DEFAULT_MAX_RETRIES
  }) {
    let retryAttempts = 0;
    const executeFetch = () => {
      Promise.all(endpoints.map(fetchSingle))
        .then(results => {
          results.forEach(({ key, data, code }) => {
            target[key] = validateData(data);
            if (target[key] === null) {
              target[key] = {};
            }
            // 直接添加 code 屬性到現有對象
            target[key].code = code;
          });
          onComplete();
        })
        .catch(error => {
          console.error("資料請求錯誤:", error);
          if (retryAttempts < maxRetries) {
            retryAttempts++;
            executeFetch();
          } else {
            console.error("已達最大重試次數，請檢查網路或伺服器狀態。");
            retryAttempts = 0;  // 重置重試次數，為下次請求做準備
            onError(error);
          }
        });
    };

    executeFetch();
  }

  return {
    fetchSingle,
    fetchAll
  };
})();
  
  
  window.url = url;
  window.DataFetcher = DataFetcher
  
  const snapshotEndpoints = [
    { key: "id", url: url.getIDUrl() },
    { key: "currency", url: url.getCURRENCYUrl(), options: url.getHeaders_POST() },
    { key: "info", url: url.getINFOUrl(), options: url.getHeaders() },
    { key: "jackpot", url: url.getJACKPOTUrl(), options: url.getHeaders() },
    { key: "list", url: url.getLISTUrl() },
    { key: "online", url: url.getONLINEUrl() },
    { key: "maintain", url: url.getMAINTAINSTATEUrl(), options: url.getHeaders_POST() },
    { key: "infoLock", url: url.getINFOLOCK(), options: url.getHeaders_POST() },
    { key: "version", url: url.getVERSION(), options: url.getHeaders() },
    { key: "setting", url: url.getSETTING(), options: url.getHeaders() },
    { key: "video", url: url.getVIDEO(), options: url.getHeaders() },
    {
      key: "cardList",
      url: url.getCARDLIST(),
      options: url.getHeaders_POST({ game_code: url.getGame(), page: 1, size: 200 }),
    },
  ];
  
  window.snapshotEndpoints = snapshotEndpoints;
  
  /** 請求快照資料 */
  function fetchSnapshots() {
    window.serverData = {};

    window.DataFetcher.fetchAll({
      endpoints: window.snapshotEndpoints,
      target: window.serverData,
      onComplete: () => {
        const requiredKeys = window.snapshotEndpoints.map(item => item.key);
        const invalidKeys = [];
        const ready = requiredKeys.every(k => {
          const data = window.serverData[k];
          // 檢查是否有 code 屬性且值為 10000
          if (data.hasOwnProperty('code') && (data.code === 10000)) { return true; }
          // 檢查資料是否存在
          if (!data) { 
            invalidKeys.push(`${k}: missing data`);
            return false; 
          }
          // 如果沒有 code 屬性但有 data 屬性，也視為有效
          if (!data.hasOwnProperty('data')) {
            invalidKeys.push(`${k}: missing 'data' property`);
            return false;
          }
          return true;
        });
        if (ready) {
          snapshotReady = true;
          tryStartGame();
        } else {
          throw new Error(`Invalid snapshot data: ${invalidKeys.join(', ')}`);
        }
      },
      onError: (err) => {
        window.showReloadDialog("載入錯誤，請檢查網路或伺服器狀態。");
      },
      maxRetries: 3
    });
  }
  
const url = {
    // 協議與伺服器主機設定（可改成 https 或其他主機）
    HTTP: "http://",
    SERVERHOST: "localhost:3000/proxy/",
  
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
  
    /** 共用 token 與驗證 Header 參數 */
    _commonHeaders: {
      Authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNhbGVyIiwibm0iOiJjYWxlciIsIm1kIjoib2tfand0X21lcl9hcGlfY29kZV9ib2Jib2IiLCJybSI6MTc0Nzc5MTA1MjE3M30.vZxQFWB8WErKbqknTM0b0v0XtVXoqtT1yr3tf1KHsxE",
      Current_Time: "1747791062568",
      Signature_Nonce: "BH8re17LK7_G-b8Fpjt68",
      Signature: "44b01db9a2696f1d55397a3fca7be9bd",
      Merchant_Code: "mer_api_code_bobbob",
    },
  
    /**
     * 取得自訂的 fetch 請求 headers（GET）
     * @returns {object} fetch 的設定物件
     */
    getHeaders() {
      return {
        method: "GET",
        headers: { ...this._commonHeaders },
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
          ...this._commonHeaders,
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
        throw new Error(`API error on ${key}: ${json.code}`);
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
          debugger;
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
  
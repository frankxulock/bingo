(function () {
    'use strict';
  
    const canvas = document.getElementById('GameCanvas');
  
    /** 快照與遊戲素材加載狀態 */
    let snapshotReady = false;
    let assetsReady = false;
  
    /** 嘗試啟動遊戲（快照與素材都載入後才執行） */
    function tryStartGame() {
      if (snapshotReady && assetsReady) {
        window.hideSplash();
      }
    }
  
    /** 快照請求重試次數 */
    let retryAttempts = 0;
    const maxRetries = 3;
  
    /** 檢查資料有效性 */
    function handleEmptyData(data) {
      return data ? data : null;
    }
  
    /** 請求快照資料 */
    function fetchSnapshots() {
      window.Snapshots = {};
  
      Promise.all([
        fetch(window.GameConfig.getIDUrl()),
        fetch(window.GameConfig.getJACKPOTUrl(), window.GameConfig.getHeaders()),
        fetch(window.GameConfig.getLISTUrl()),
        fetch(window.GameConfig.getONLINEUrl()),
      ])
        .then(responses => Promise.all(responses.map(r => {
          if (!r.ok) throw new Error("Network error");
          return r.json();
        })))
        .then(([idData, jackpotData, listData, onlineData]) => {
          window.Snapshots["id"] = handleEmptyData(idData.data);
          window.Snapshots["jackpot"] = handleEmptyData(jackpotData.data);
          window.Snapshots["list"] = handleEmptyData(listData.data);
          window.Snapshots["online"] = handleEmptyData(onlineData.data);
  
          console.log("快照資料:", window.Snapshots);
  
          if (window.Snapshots.id && window.Snapshots.jackpot && window.Snapshots.list && window.Snapshots.online) {
            snapshotReady = true;
            tryStartGame();
          } else {
            throw new Error("Invalid snapshot data received");
          }
        })
        .catch(error => {
          console.error("快照資料請求錯誤:", error);
          if (retryAttempts < maxRetries) {
            retryAttempts++;
            console.log(`Retrying... Attempt ${retryAttempts}`);
            fetchSnapshots();
          } else {
            console.warn("已達到最大重試次數，停止請求。");
          }
        });
    }

    /** 頁面載入後主程序 */
    window.onload = async function () {
      if (window.__quick_compile_engine__) {
        window.__quick_compile_engine__.load(onload);
      } else {
        onload();
      }
    };
  
    async function onload() {
      fetchSnapshots(); // 開始獲取快照資料
  
      // 接收編輯器通知（開發用）
      const socket = window.io();
      socket.on('browser:reload', () => window.location.reload());
      socket.on('browser:confirm-reload', () => {
        if (confirm('Reload?')) window.location.reload();
      });
  
      // 初始化引擎配置
      cc.macro.ENABLE_TRANSPARENT_CANVAS = true;
      cc.macro.ENABLE_WEBGL_ANTIALIAS = true;
  
      const onStart = function () {
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);
  
        const splash = document.getElementById('splash');
        const progressBar = splash.querySelector('.progress-bar span');
  
        cc.game.pause();
  
        cc.assetManager.loadAny({ url: 'preview-scene.json', __isNative__: false }, null,
          (finish, totalCount) => {
            const percent = 100 * finish / totalCount;
            if (progressBar) progressBar.style.width = percent.toFixed(2) + '%';
          },
          (err, sceneAsset) => {
            if (err) return console.error(err.message, err.stack);
            const scene = sceneAsset.scene;
            scene._name = sceneAsset._name;
            cc.assetManager.dependUtil._depends.add(scene._id, cc.assetManager.dependUtil._depends.get('preview-scene.json'));
            cc.director.runSceneImmediate(scene, () => cc.game.resume());
          });
      };
  
      const option = {
        id: canvas,
        debugMode: _CCSettings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: _CCSettings.debug,
        frameRate: 60,
        groupList: _CCSettings.groupList,
        collisionMatrix: _CCSettings.collisionMatrix,
      };
  
      cc.assetManager.init({
        importBase: 'assets/others/import',
        nativeBase: 'assets/others/native'
      });
  
      const { RESOURCES, INTERNAL, MAIN } = cc.AssetManager.BuiltinBundleName;
      const bundleRoot = [INTERNAL];
      if (_CCSettings.hasResourcesBundle) bundleRoot.push(RESOURCES);
  
      let count = 0;
      function cb(err) {
        if (err) return console.error(err);
        count++;
        if (count === bundleRoot.length + 1) {
          cc.assetManager.loadBundle(MAIN, function (err) {
            if (!err) {
              assetsReady = true;
              tryStartGame();
              cc.game.run(option, onStart);
            }
          });
        }
      }
  
      // 加載外部插件腳本
      cc.assetManager.loadScript(
        _CCSettings.jsList.map(x => '/plugins/' + x),
        cb
      );
  
      // 載入內建 bundle
      for (let i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle('assets/' + bundleRoot[i], cb);
      }
    }
  })();
  
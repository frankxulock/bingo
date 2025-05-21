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
        // 廣播遊戲資料給主場景
        const scene = cc.director.getScene();
        if (scene && scene.isValid) {
          scene.emit("Game:InitData", window.snapshotData); // 可以附帶資料
        } else {
          console.warn("主場景尚未就緒，無法廣播 Game:InitData");
        }
      }
    }
  
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
              invalidKeys.push(`${k}: 資料缺失`);
              return false; 
            }
            return true;
          });
          if (ready) {
            snapshotReady = true;
            tryStartGame();
          } else {
            throw new Error(`快照資料無效: ${invalidKeys.join(', ')}`);
          }
        },
        onError: (err) => {
          window.showReloadDialog("載入錯誤，請檢查網路或伺服器狀態。");
        },
        maxRetries: 3
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
      const totalTasks = bundleRoot.length + 1; // 所有 loadBundle + 1 次 loadScript

      function cb(err) {
        if (err) {
          console.error(err);
          return;
        }

        count++;

        if (count === totalTasks) {
          // 所有 bundle + script 都完成後，再載入主 bundle
          cc.assetManager.loadBundle(MAIN, function (err) {
            if (err) {
              console.error("載入主 bundle 失敗:", err);
              return;
            }

            assetsReady = true;
            tryStartGame(); // 這裡才會啟動遊戲邏輯
            cc.game.run(option, onStart);
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
  
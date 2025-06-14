window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    
    // 在非开发模式下禁用所有日志输出
    if (!CC_DEV) { // 仅在非开发模式下执行
        // cc.log = () => {};
        // cc.warn = () => {};
        // // cc.error = () => {};
        // console.log = () => {};
        // console.warn = () => {};
        // // console.error = () => {};
        // console.info = () => {};
        // console.debug = () => {};
        // console.trace = () => {};
    }
    
    var onProgress = null;
    
    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;

    // Set additional settings
    cc.macro.ENABLE_TRANSPARENT_CANVAS = true;  // Enable transparent canvas
    cc.macro.ENABLE_WEBGL_ANTIALIAS = true;     // Enable WebGL antialiasing
    cc.dynamicAtlasManager.enabled = true;  // 啟動動態合批

    /** 快照與遊戲素材加載狀態 */
    var snapshotReady = false;
    var assetsReady = false;

    /** 嘗試啟動遊戲（快照與素材都載入後才執行） */
    function tryStartGame() {
        if (snapshotReady && assetsReady) {
            window.hideSplash();  // 等兩者都完成後才隱藏 loading splash
            // 廣播遊戲資料給主場景
            const scene = cc.director.getScene();
            if (scene && scene.isValid) {
                scene.emit("Game:InitData", window.snapshotData); // 可以附帶資料
            } else {
                console.warn("主場景尚未就緒，無法廣播 Game:InitData");
            }
        }
    }

    function setLoadingDisplay() {
        // Loading splash scene
        var splash = document.getElementById('splash');
        var progressBar = splash.querySelector('.progress-bar span');
        onProgress = function (finish, total) {
            var percent = 100 * finish / total;
            if (progressBar) {
                progressBar.style.width = percent.toFixed(2) + '%';
            }
        };
        splash.style.display = 'block';
        progressBar.style.width = '0%';
    }

    var onStart = function () {
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isBrowser) {
            setLoadingDisplay();
        }

        if (cc.sys.isMobile) {
            if (settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
            else if (settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            cc.view.enableAutoFullScreen([
                cc.sys.BROWSER_TYPE_BAIDU,
                cc.sys.BROWSER_TYPE_BAIDU_APP,
                cc.sys.BROWSER_TYPE_WECHAT,
                cc.sys.BROWSER_TYPE_MOBILE_QQ,
                cc.sys.BROWSER_TYPE_MIUI,
                cc.sys.BROWSER_TYPE_HUAWEI,
                cc.sys.BROWSER_TYPE_UC,
            ].indexOf(cc.sys.browserType) < 0);
        }

        // Limit downloading max concurrent task to 2,
        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });

        bundle.loadScene(launchScene, null, onProgress,
            function (err, scene) {
                if (!err) {
                    cc.director.runSceneImmediate(scene);
                    if (cc.sys.isBrowser) {
                        // show canvas
                        var canvas = document.getElementById('GameCanvas');
                        canvas.style.visibility = '';
                        var div = document.getElementById('GameDiv');
                        if (div) {
                            div.style.backgroundImage = '';
                        }
                        console.log('Success to load scene: ' + launchScene);
                        assetsReady = true;
                        tryStartGame();  // 等待快照與素材都完成後才啟動遊戲
                    }
                }
            }
        );
    };

    var option = {
        id: 'GameCanvas',
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    };

    cc.assetManager.init({ 
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server
    });
    
    var bundleRoot = [INTERNAL];
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;
    function cb(err) {
        if (err) return console.error(err);
        count++;
        if (count === bundleRoot.length + 1) {
            cc.assetManager.loadBundle(MAIN, function (err) {
                if (!err) {
                    cc.game.run(option, onStart);  // 遊戲初始化
                }
            });
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

    // 開始加載快照資料
    fetchSnapshots();
    cc.assetManager.loadScript(settings.jsList.map(function (x) { return 'src/' + x; }), cb);

    for (var i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }
};

if (window.jsb) {
    var isRuntime = (typeof loadRuntime === 'function');
    if (isRuntime) {
        require('src/settings.js');
        require('src/cocos2d-runtime.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/engine/index.js');
    }
    else {
        require('src/settings.js');
        require('src/cocos2d-jsb.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/jsb-engine.js');
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}

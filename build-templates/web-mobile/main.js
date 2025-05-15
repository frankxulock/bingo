window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    var onProgress = null;
    
    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;

    // Set additional settings
    cc.macro.ENABLE_TRANSPARENT_CANVAS = true;  // Enable transparent canvas
    cc.macro.ENABLE_WEBGL_ANTIALIAS = true;     // Enable WebGL antialiasing

    /** 快照與遊戲素材加載狀態 */
    var snapshotReady = false;
    var assetsReady = false;

    /** 嘗試啟動遊戲（快照與素材都載入後才執行） */
    function tryStartGame() {
        if (snapshotReady && assetsReady) {
            window.hideSplash();  // 等兩者都完成後才隱藏 loading splash
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
                    assetsReady = true;
                    tryStartGame();  // 等待快照與素材都完成後才啟動遊戲
                    cc.game.run(option, onStart);  // 遊戲初始化
                }
            });
        }
    }

    /** 請求快照資料的重試機制 */
    var retryAttempts = 0;
    const maxRetries = 3;

    function handleEmptyData(data) {
        return (data) ? data : null; // Return null if data is empty or invalid
    }

    function fetchSnapshots() {
        window.Snapshots = {};
        // 請求不同類型的資料
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

                // Check if all necessary data is valid
                if (window.Snapshots["id"] && window.Snapshots["jackpot"] && window.Snapshots["list"] && window.Snapshots["online"]) {
                    snapshotReady = true;
                    tryStartGame();
                } else {
                    throw new Error("Invalid snapshot data received");
                }
            })
            .catch(error => {
                console.log("快照資料請求錯誤:", error);
                if (retryAttempts < maxRetries) {
                    retryAttempts++;
                    console.log(`Retrying... Attempt ${retryAttempts}`);
                    fetchSnapshots(); // Retry fetching data
                } else {
                    console.log("Reached maximum retry attempts. No further actions will be taken.");
                }
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
        require('src/settings.c13e2.js');
        require('src/cocos2d-runtime.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/engine/index.js');
    }
    else {
        require('src/settings.c13e2.js');
        require('src/cocos2d-jsb.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/jsb-engine.js');
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}

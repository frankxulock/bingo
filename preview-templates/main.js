(function () {
    'use strict';

    var canvas = document.getElementById('GameCanvas');
    
    /** 快照與遊戲素材加載狀態 */
    var snapshotReady = false;
    var assetsReady = false;

    /** 嘗試啟動遊戲（快照與素材都載入後才執行） */
    function tryStartGame() {
        if (snapshotReady && assetsReady) {
            window.hideSplash();
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

    /** 頁面載入後觸發 */
    window.onload = function () {
        if (window.__quick_compile_engine__) {
            window.__quick_compile_engine__.load(onload);
        } else {
            onload();
        }
    };

    function onload() {
        fetchSnapshots(); // 開始獲取快照資料

        // 接收瀏覽器重載通知（來自編輯器）
        var socket = window.io();
        socket.on('browser:reload', function () {
            window.location.reload();
        });
        socket.on('browser:confirm-reload', function () {
            if (confirm('Reload?')) {
                window.location.reload();
            }
        });

        // 初始化引擎設置
        var engineInited = false;
        cc.macro.ENABLE_TRANSPARENT_CANVAS = true;
        cc.macro.ENABLE_WEBGL_ANTIALIAS = true;

        var onStart = function () {
            cc.view.enableRetina(true);
            cc.view.resizeWithBrowserSize(true);

            var splash = document.getElementById('splash');
            var progressBar = splash.querySelector('.progress-bar span');

            cc.game.pause();

            engineInited = true;

            cc.assetManager.loadAny({ url: 'preview-scene.json', __isNative__: false }, null,
                function (finish, totalCount) {
                    var percent = 100 * finish / totalCount;
                    if (progressBar) {
                        progressBar.style.width = percent.toFixed(2) + '%';
                    }
                },
                function (err, sceneAsset) {
                    if (err) {
                        console.error(err.message, err.stack);
                        return;
                    }
                    var scene = sceneAsset.scene;
                    scene._name = sceneAsset._name;
                    cc.assetManager.dependUtil._depends.add(scene._id, cc.assetManager.dependUtil._depends.get('preview-scene.json'));
                    cc.director.runSceneImmediate(scene, function () {
                        cc.game.resume();
                    });
                });

            _CCSettings = undefined;
        };

        var option = {
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

        let { RESOURCES, INTERNAL, MAIN } = cc.AssetManager.BuiltinBundleName;
        var bundleRoot = [INTERNAL];
        _CCSettings.hasResourcesBundle && bundleRoot.push(RESOURCES);

        var count = 0;
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

        // 載入外部插件
        cc.assetManager.loadScript(
            _CCSettings.jsList.map(function (x) { return '/plugins/' + x; }),
            cb
        );

        // 載入內建 bundle
        for (let i = 0; i < bundleRoot.length; i++) {
            cc.assetManager.loadBundle('assets/' + bundleRoot[i], cb);
        }
    }
})();

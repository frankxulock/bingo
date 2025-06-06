// 2022.07.11 https://web.sdk.qcloud.com/player/tcplayerlite/release/v2.4.5/TcPlayer-2.4.5.js
!function(e, t) {
    if ("object" == typeof exports && "object" == typeof module)
        module.exports = t();
    else if ("function" == typeof define && define.amd)
        define([], t);
    else {
        var i = t();
        for (var o in i)
            ("object" == typeof exports ? exports : e)[o] = i[o]
    }
}(this, function() {
    return function(e) {
        function t(o) {
            if (i[o])
                return i[o].exports;
            var n = i[o] = {
                exports: {},
                id: o,
                loaded: !1
            };
            return e[o].call(n.exports, n, n.exports, t),
            n.loaded = !0,
            n.exports
        }
        var i = {};
        return t.m = e,
        t.c = i,
        t.p = "//imgcache.qq.com/open/qcloud/video/vcplayer/",
        t(0)
    }([function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function r(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function s(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        function a(e, t) {
            if (d.IS_MOBILE ? (e.flash = !1,
            d.IS_X5TBS && e.x5_player ? b.mobile = ["webrtc", "flv", "m3u8", "mp4"] : d.IS_ENABLED_MSE && e.h5_flv && (b.mobile = ["webrtc", "flv", "m3u8", "mp4"])) : (e.flash = !!t.isFormat("rtmp") || e.flash,
            t.isFormat("flv") && void 0 == e.flash && (e.flash = !0),
            e.flash ? d.IS_ENABLED_FLASH || (e.flash = !1,
            d.IS_ENABLED_MSE ? e.h5_flv && (d.IS_SAFARI && v.compareVersion(d.SAFARI_VERSION, "10.1") > -1 || !d.IS_SAFARI) ? b.pc = ["webrtc", "flv", "m3u8", "mp4"] : b.pc = ["webrtc", "m3u8", "mp4"] : b.pc = ["webrtc", "mp4"]) : d.IS_ENABLED_MSE ? e.h5_flv && (d.IS_SAFARI && v.compareVersion(d.SAFARI_VERSION, "10.1") > -1 || !d.IS_SAFARI) ? b.pc = ["webrtc", "flv", "m3u8", "mp4"] : b.pc = ["webrtc", "m3u8", "mp4"] : d.IS_ENABLED_FLASH ? e.flash = !0 : b.pc = ["webrtc", "mp4"]),
            e.clarity) {
                var i = S.indexOf(e.clarity);
                S.splice(i, 1),
                S.unshift(e.clarity)
            }
        }
        function l(e) {
            var t = {
                urls: {
                    m3u8: {
                        od: e.m3u8 || "",
                        hd: e.m3u8_hd || "",
                        sd: e.m3u8_sd || ""
                    },
                    flv: {
                        od: e.flv || "",
                        hd: e.flv_hd || "",
                        sd: e.flv_sd || ""
                    },
                    mp4: {
                        od: e.mp4 || "",
                        hd: e.mp4_hd || "",
                        sd: e.mp4_sd || ""
                    },
                    rtmp: {
                        od: e.rtmp || "",
                        hd: e.rtmp_hd || "",
                        sd: e.rtmp_sd || ""
                    },
                    webrtc: {
                        od: e.webrtc || "",
                        hd: e.webrtc_hd || "",
                        sd: e.webrtc_sd || ""
                    }
                },
                isClarity: function(e) {
                    var i = t.urls;
                    return !!(i.m3u8[e] || i.flv[e] || i.mp4[e] || i.rtmp[e] || i.webrtc[e])
                },
                isFormat: function(e) {
                    var i = t.urls;
                    return !!i[e].od || !!i[e].hd || !!i[e].sd
                },
                hasUrl: function() {
                    return this.isFormat("rtmp") || this.isFormat("flv") || this.isFormat("m3u8") || this.isFormat("mp4") || this.isFormat("webrtc")
                }
            };
            t.definitions = [];
            for (var i = 0; i < S.length; i++)
                t.isClarity(S[i]) && t.definitions.push(S[i]);
            a(e, t);
            var o = p(t);
            return o && (t.curUrl = o.url,
            t.curDef = o.definition,
            t.curFormat = o.format),
            t
        }
        function c(e, t, i) {
            var o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : b
              , n = ""
              , r = void 0;
            i = i || (d.IS_MOBILE ? o.mobile : o.pc);
            for (var s = 0; s < i.length; s++)
                if (n = i[s],
                e[n][t]) {
                    r = {
                        definition: t,
                        url: e[n][t],
                        format: n
                    };
                    break
                }
            return r
        }
        function u(e, t) {
            for (var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : S, o = "", n = 0; n < i.length; n++)
                if (o = i[n],
                e[t][o])
                    return {
                        definition: o,
                        url: e[t][o]
                    }
        }
        function p(e) {
            for (var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : b, i = void 0, o = "", n = e.urls, r = d.IS_MOBILE ? t.mobile : t.pc, s = 0; s < r.length; s++)
                if (o = r[s],
                e.isFormat(o)) {
                    i = u(n, o),
                    i.format = o;
                    break
                }
            return i
        }
        t.__esModule = !0,
        t.TcPlayer = void 0;
        var h = i(1)
          , d = o(h)
          , f = i(2)
          , y = (o(f),
        i(3))
          , v = o(y)
          , A = i(4)
          , m = o(A)
          , g = i(5)
          , w = m.MSG
          , b = {
            mobile: ["webrtc", "m3u8", "mp4"],
            pc: ["webrtc", "rtmp", "flv", "m3u8", "mp4"]
        }
          , S = ["od", "hd", "sd"];
        t.TcPlayer = function(e) {
            function t(i, o) {
                n(this, t);
                var s = l(o);
                S = ["od", "hd", "sd"];
                var a = {
                    owner: i,
                    videoSource: s,
                    src: s.curUrl,
                    autoplay: o.autoplay,
                    live: o.live,
                    flash: o.flash,
                    flashUrl: o.flashUrl,
                    poster: o.poster,
                    width: o.width,
                    height: o.height,
                    volume: o.volume,
                    listener: o.listener,
                    wording: o.wording,
                    controls: o.controls,
                    clarity: o.clarity,
                    clarityLabel: o.clarityLabel,
                    showLoading: "boolean" != typeof o.showLoading || o.showLoading,
                    pausePosterEnabled: void 0 === o.pausePosterEnabled || o.pausePosterEnabled,
                    fullscreenEnabled: void 0 === o.fuScrnEnabled || o.fuScrnEnabled,
                    systemFullscreen: o.systemFullscreen || !1,
                    hls: o.hls || "0.12.4",
                    h5_flv: o.h5_flv,
                    x5_player: o.x5_player !== !1,
                    x5_type: o.x5_type,
                    x5_fullscreen: o.x5_fullscreen,
                    x5_orientation: o.x5_orientation,
                    x5_playsinline: o.x5_playsinline,
                    preload: o.preload || "auto",
                    hlsConfig: o.hlsConfig,
                    flvConfig: o.flvConfig,
                    webrtcConfig: o.webrtcConfig
                };
                return r(this, e.call(this, a))
            }
            return s(t, e),
            t.prototype._switchClarity = function(e) {
                e = e || "od";
                var t = this.currentTime()
                  , i = this.options.videoSource
                  , o = c(i.urls, e)
                  , n = this.playing();
                this.load(o.url),
                i.curUrl = o.url,
                i.curDef = o.definition,
                i.curFormat = o.format;
                var r = v.bind(this, function() {
                    parseInt(this.duration() - t) > 0 && !this.options.live && this.currentTime(t),
                    n && this.play(!0),
                    m.unsub(w.MetaLoaded, "*", r, this)
                });
                m.sub(w.MetaLoaded, "*", r, this)
            }
            ,
            t.prototype.switchClarity = function(e) {
                this.claritySwitcher ? this.claritySwitcher.setClarity(e) : this._switchClarity(e)
            }
            ,
            t.prototype.handleMsg = function(t) {
                e.prototype.handleMsg.call(this, t)
            }
            ,
            t
        }(g.Player)
    }
    , function(e, t) {
        "use strict";
        t.__esModule = !0;
        var i = window.navigator.userAgent
          , o = /AppleWebKit\/([\d.]+)/i.exec(i)
          , n = o ? parseFloat(o.pop()) : null
          , r = t.IS_IPAD = /iPad/i.test(i)
          , s = t.IS_IPHONE = /iPhone/i.test(i) && !r
          , a = t.IS_IPHONE_UA = /safari/gi.test(i) && (896 === window.screen.height && 414 === window.screen.width || 812 === window.screen.height && 375 === window.screen.width || 736 === window.screen.height && 414 === window.screen.width || 667 === window.screen.height && 375 === window.screen.width || 568 === window.screen.height && 320 === window.screen.width);
        812 == screen.height && 375 == screen.width;
        var l = t.IS_IPOD = /iPod/i.test(i)
          , c = t.IS_IOS = s || r || l || a
          , u = t.IOS_VERSION_ARRAY = function() {
            var e = i.match(/OS (\d+)_(\d+)_?(\d+)?/i);
            return e && [parseInt(e[1], 10), parseInt(e[2], 10), parseInt(e[3] || "0", 10)] || []
        }()
          , p = (t.IOS_VERSION = function() {
            var e = i.match(/OS (\d+)_/i);
            if (e && e[1])
                return e[1]
        }(),
        t.IS_MAC = /Mac/i.test(i),
        t.IS_ANDROID = /Android/i.test(i))
          , h = t.ANDROID_VERSION = function() {
            var e, t, o = i.match(/Android (\d+)(?:\.(\d+))?(?:\.(\d+))*/i);
            return o ? (e = o[1] && parseFloat(o[1]),
            t = o[2] && parseFloat(o[2]),
            e && t ? parseFloat(o[1] + "." + o[2]) : e ? e : null) : null
        }()
          , d = (t.IS_OLD_ANDROID = p && /webkit/i.test(i) && h < 2.3,
        t.IS_NATIVE_ANDROID = p && h < 5 && n < 537,
        t.IS_ALIPAY = /Alipay/i.test(i),
        t.IS_FIREFOX = /Firefox/i.test(i))
          , f = t.FIREFOX_VERSION = d && function() {
            var e = i.match(/Firefox\/(\d+)/);
            return e && e[1] ? parseFloat(e[1]) : null
        }()
          , y = t.IS_EDGE = /Edge/i.test(i)
          , v = t.IS_EDG = /Edg/i.test(i)
          , A = t.EDG_VERSION = v && function() {
            var e = i.match(/Edg\/(\d+)/);
            return e && e[1] ? parseFloat(e[1]) : null
        }()
          , m = t.IS_CHROME = !y && /Chrome/i.test(i)
          , g = t.IS_SAFARI = !y && !m && /Safari/i.test(i)
          , w = (t.SAFARI_VERSION = function() {
            if (!g)
                return null;
            var e = /version\/([\d.]+)/i
              , t = i.match(e);
            return t ? t[1] : void 0
        }(),
        t.IS_IE8 = /MSIE\s8\.0/.test(i),
        t.IS_IE9 = /MSIE\s9\.0/.test(i),
        t.IS_IE = /(msie\s|trident.*rv:)([\w.]+)/i.test(i))
          , b = (t.IE_VERSION = function() {
            var e = /(msie\s|trident.*rv:)([\w.]+)/i
              , t = i.match(e);
            return t ? t[2] : null
        }(),
        t.TOUCH_ENABLED = !!("ontouchstart"in window || window.DocumentTouch && document instanceof window.DocumentTouch),
        t.BACKGROUND_SIZE_SUPPORTED = "backgroundSize"in document.createElement("video").style,
        t.HASVIDEO = !!document.createElement("video").canPlayType,
        t.IS_X5TBS = /TBS\/\d+/i.test(i))
          , S = (t.TBS_VERSION = function() {
            var e = i.match(/TBS\/(\d+)/i);
            if (e && e[1])
                return e[1]
        }(),
        t.IS_MQQB = !b && /MQQBrowser\/\d+/i.test(i),
        t.IS_QQB = !b && / QQBrowser\/\d+/i.test(i),
        t.IS_WECHAT = /(micromessenger|webbrowser)/i.test(i),
        t.IS_PCWECHAT = /(macwechat|windowswechat)/i.test(i),
        t.IS_UC = /UCBrowser\/(\d+)\./i.test(i))
          , I = (t.IS_VIVO = /VivoBrowser\/(\d+)\./i.test(i),
        t.IS_ONEPLUS_3010 = /ONEPLUS A3010/i.test(i),
        t.IS_MQQ = / QQ\/\d+/i.test(i),
        t.IS_MOBILE = p || c,
        t.IS_FILE_PROTOCOL = /file:/.test(location.protocol),
        t.FLASH_VERSION = null)
          , M = (t.IS_ENABLED_FLASH = function() {
            var e;
            if (document.all || w)
                try {
                    if (e = new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))
                        return t.FLASH_VERSION = I = e.GetVariable("$version").split(" ")[1].replace(/,/g, "."),
                        window.console && console.log("FLASH_VERSION", I),
                        !0
                } catch (e) {
                    return !1
                }
            else
                try {
                    if (navigator.plugins && navigator.plugins.length > 0 && (e = navigator.plugins["Shockwave Flash"])) {
                        for (var i = e.description.split(" "), o = 0; o < i.length; ++o)
                            isNaN(parseInt(i[o])) || (t.FLASH_VERSION = I = i[o],
                            window.console && console.log("FLASH_VERSION", parseInt(i[o])));
                        return !0
                    }
                } catch (e) {
                    return !1
                }
            return !1
        }(),
        t.IS_ENABLED_MSE = function() {
            var e = window.MediaSource = window.MediaSource || window.WebKitMediaSource
              , t = window.SourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer
              , i = e && "function" == typeof e.isTypeSupported && e.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"')
              , o = !t || t.prototype && "function" == typeof t.prototype.appendBuffer && "function" == typeof t.prototype.remove;
            if (!c)
                return i && o
        }(),
        t.BROWSER_TYPE = function() {
            return i.indexOf("Edge") > -1 ? "Edge" : i.indexOf(".NET") > -1 ? "IE" : i.indexOf("QQBrowser") > -1 ? "QQBrowser" : i.indexOf("Mac OS") > -1 ? "safari" : i.indexOf("Chrome") > -1 ? "chrome" : "other"
        }(),
        t.isBrowserSupportWebRTC = function() {
            var e = 56
              , t = 80;
            return !S && !y && (!(v && A < t) && (!(d && f < e) && !(!b && g && c && (0 === u.length || u[0] < 11 || 11 === u[0] && u[1] < 1 || 11 === u[0] && 1 === u[1] && u[2] < 2))))
        }
        );
        t.IS_ENABLED_WEBRTC = function() {
            var e = function() {
                if (!M())
                    return !1;
                var e = !1;
                return ["RTCPeerConnection", "webkitRTCPeerConnection", "RTCIceGatherer"].forEach(function(t) {
                    e || t in window && (e = !0)
                }),
                e
            }
              , t = new Promise(function(t, i) {
                try {
                    var o = {
                        iceServers: [],
                        sdpSemantics: "unified-plan"
                    }
                      , n = new RTCPeerConnection(o)
                      , r = {};
                    n.addTransceiver ? (n.addTransceiver("audio", {
                        direction: "recvonly"
                    }),
                    n.addTransceiver("video", {
                        direction: "recvonly"
                    })) : r = {
                        offerToReceiveVideo: !0,
                        offerToReceiveAudio: !0
                    },
                    n.createOffer(r).then(function(i) {
                        var o = i.sdp.toLowerCase().indexOf("h264") > -1;
                        n.close(),
                        t(e() && o)
                    })
                } catch (e) {
                    i()
                }
            }
            );
            return t
        }()
    }
    , function(e, t) {
        "use strict";
        function i(e, t, i) {
            return e ? (e.addEventListener ? e.addEventListener(t, i, !1) : e.attachEvent && e.attachEvent("on" + t, i),
            i) : console.warn("element not exists")
        }
        function o(e, t, i) {
            return e ? void (e.removeEventListener ? e.removeEventListener(t, i, !1) : e.detachEvent && e.detachEvent("on" + t, i)) : console.warn("element not exists")
        }
        function n() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "div"
              , t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
              , i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
              , o = document.createElement(e);
            for (var n in t)
                if (t.hasOwnProperty(n)) {
                    var r = t[n];
                    null === r ? o.removeAttribute(r) : o.setAttribute(n, r)
                }
            for (var s in i)
                i.hasOwnProperty(s) && (o[s] = i[s]);
            return o
        }
        function r(e) {
            return document.getElementById(e)
        }
        function s(e, t) {
            e.classList ? e.classList.add(t) : c(e, t) || (e.className = e.className + " " + t)
        }
        function a(e, t) {
            e.classList ? e.classList.remove(t) : e.className = e.className.replace(u(t), " ")
        }
        function l(e, t, i) {
            i ? s(e, t) : a(e, t)
        }
        function c(e, t) {
            return e.classList ? e.classList.contains(t) : u(t).test(e.className)
        }
        function u(e) {
            return new RegExp("(^|\\s)" + e + "($|\\s)")
        }
        function p(e) {
            var t = void 0;
            if (e.getBoundingClientRect && e.parentNode && (t = e.getBoundingClientRect()),
            !t)
                return {
                    left: 0,
                    top: 0
                };
            var i = document.documentElement
              , o = document.body
              , n = i.clientLeft || o.clientLeft || 0
              , r = window.pageXOffset || o.scrollLeft
              , s = t.left + r - n
              , a = i.clientTop || o.clientTop || 0
              , l = window.pageYOffset || o.scrollTop
              , c = t.top + l - a;
            return {
                left: Math.round(s),
                top: Math.round(c)
            }
        }
        function h(e, t, i) {
            var o = {}
              , n = i || p(e)
              , r = e.offsetWidth
              , s = e.offsetHeight
              , a = n.top
              , l = n.left
              , c = t.pageY || t.clientY
              , u = t.pageX || t.clientX;
            return t.changedTouches && (u = t.changedTouches[0].pageX,
            c = t.changedTouches[0].pageY),
            o.y = Math.max(0, Math.min(1, (a - c + s) / s)),
            o.x = Math.max(0, Math.min(1, (u - l) / r)),
            o
        }
        function d(e, t, i, o) {
            var n = arguments.length > 4 && void 0 !== arguments[4] && arguments[4];
            if ("function" == typeof window.define && window.define.amd && i) {
                var r;
                return window.require && window.require.config && window.require.config({
                    paths: (r = {},
                    r[e] = t.replace(".js", ""),
                    r)
                }),
                window.require && window.require([e], function(e) {
                    i(e)
                }),
                !1
            }
            var s = document.createElement("script");
            if (s.onload = s.onreadystatechange = function() {
                this.readyState && "loaded" !== this.readyState && "complete" !== this.readyState || ("function" == typeof i && i(),
                s.onload = s.onreadystatechange = null,
                s.parentNode && !n && s.parentNode.removeChild(s))
            }
            ,
            o)
                for (var a in o)
                    if (o.hasOwnProperty(a)) {
                        var l = o[a];
                        null === l ? s.removeAttribute(l) : s.setAttribute(a, l)
                    }
            s.src = t,
            document.getElementsByTagName("head")[0].appendChild(s)
        }
        function f() {
            var e = document
              , t = e.documentElement
              , i = e.body;
            return {
                width: t && t.clientWidth || i && i.offsetWidth || window.innerWidth || 0,
                height: t && t.clientHeight || i && i.offsetHeight || window.innerHeight || 0
            }
        }
        t.__esModule = !0,
        t.on = i,
        t.off = o,
        t.createEl = n,
        t.get = r,
        t.addClass = s,
        t.removeClass = a,
        t.toggleClass = l,
        t.hasClass = c,
        t.findElPosition = p,
        t.getPointerPosition = h,
        t.loadScript = d,
        t.getViewportSize = f
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n() {
            return E++
        }
        function r(e, t, i) {
            t.guid || (t.guid = n());
            var o = function() {
                t.apply(e, arguments)
            };
            return o.guid = i ? i + "_" + t.guid : t.guid,
            o
        }
        function s(e) {
            if (e instanceof Array)
                return 0 === e.length;
            for (var t in e)
                if (e.hasOwnProperty(t))
                    return !1;
            return !0
        }
        function a(e) {
            e |= 0;
            var t = 3600
              , i = 60
              , o = e / t | 0
              , n = (e - o * t) / i | 0
              , r = e - o * t - n * i;
            return o = o > 0 ? o + ":" : "",
            n = n > 0 ? n + ":" : "00:",
            r = r > 0 ? r + "" : o.length > 0 || n.length > 0 ? "00" : "00:00",
            o = 2 == o.length ? "0" + o : o,
            n = 2 == n.length ? "0" + n : n,
            r = 1 == r.length ? "0" + r : r,
            o + n + r
        }
        function l(e) {
            h.__isFullscreen = !!document[_.fullscreenElement],
            h.__isFullscreen || (M.IS_X5TBS && w.off(h.player.video.el, "x5videoexitfullscreen", c),
            w.off(document, _.fullscreenchange, l)),
            S.pub({
                type: b.MSG.FullScreen,
                src: "util",
                ts: e.timeStamp,
                detail: {
                    isFullscreen: h.__isFullscreen
                }
            }, h.player)
        }
        function c(e) {
            "x5videoexitfullscreen" === e.type && (h.__isFullscreen = !1,
            w.off(document, _.fullscreenchange, l),
            w.off(h.player.video.el, "x5videoexitfullscreen", c),
            S.pub({
                type: b.MSG.FullScreen,
                src: "util",
                ts: e.timeStamp,
                detail: {
                    isFullscreen: !1
                }
            }, h.player))
        }
        function u(e) {
            "webkitbeginfullscreen" == e.type ? (w.off(h.player.video.el, "webkitbeginfullscreen", u),
            w.on(h.player.video.el, "webkitendfullscreen", u),
            S.pub({
                type: b.MSG.FullScreen,
                src: "util",
                ts: e.timeStamp,
                detail: {
                    isFullscreen: !0
                }
            }, h.player)) : "webkitendfullscreen" == e.type && (w.off(h.player.video.el, "webkitendfullscreen", u),
            S.pub({
                type: b.MSG.FullScreen,
                src: "util",
                ts: e.timeStamp,
                detail: {
                    isFullscreen: !1
                }
            }, h.player))
        }
        function p(e) {
            27 === e.keyCode && h(h.player, !1)
        }
        function h(e, t, i) {
            if ("undefined" == typeof t)
                return h.__isFullscreen || !1;
            var o = e.options.systemFullscreen;
            h.player = e,
            _.requestFullscreen ? t ? (M.IS_X5TBS && w.on(e.video.el, "x5videoexitfullscreen", c),
            w.on(document, _.fullscreenchange, l),
            i && i[_.requestFullscreen]()) : document[_.exitFullscreen]() : o && e.video.el.webkitEnterFullScreen ? (w.on(e.video.el, "webkitbeginfullscreen", u),
            t ? e.video.el.webkitEnterFullScreen() : e.video.el.webkitExitFullscreen()) : (h.__isFullscreen = t,
            h.__isFullscreen ? (h.__origOverflow = document.documentElement.style.overflow,
            document.documentElement.style.overflow = "hidden",
            w.on(document, "keydown", p)) : (document.documentElement.style.overflow = h.__origOverflow,
            w.off(document, "keydown", p)),
            w.toggleClass(document.body, "vcp-full-window", t),
            S.pub({
                type: b.MSG.FullScreen,
                src: "util",
                detail: {
                    isFullscreen: h.__isFullscreen
                }
            }, h.player))
        }
        function d(e) {
            for (var t = arguments.length, i = Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++)
                i[o - 1] = arguments[o];
            for (var n = 0; n < i.length; n++) {
                var r = i[n];
                for (var s in r)
                    r.hasOwnProperty(s) && (e[s] = e[s] || r[s])
            }
            return e
        }
        function f(e, t) {
            return "undefined" == typeof t ? JSON.parse(localStorage[e] || "null") : void (localStorage[e] = JSON.stringify(t))
        }
        function y(e, t) {
            if (e = e || "0.0.0",
            t = t || "0.0.0",
            e == t)
                return 0;
            for (var i = e.split("."), o = t.split("."), n = Math.max(i.length, o.length), r = 0; r < n; r++) {
                var s = ~~o[r]
                  , a = ~~i[r];
                if (s < a)
                    return 1;
                if (s > a)
                    return -1
            }
            return -1
        }
        function v(e) {
            return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#39;").replace(/\//g, "&#x2F;")
        }
        function A(e) {
            var t = "unknown";
            return e.isFormat("rtmp") ? t = "rtmp" : e.isFormat("flv") ? t = "flv" : e.isFormat("m3u8") ? t = "m3u8" : e.isFormat("mp4") && (t = "mp4"),
            t
        }
        function m(e, t) {
            e = e.replace(/^(http|https):/, "");
            var i = window.location.protocol;
            return "http:" != i && "https:" != i && (i = t || "https:"),
            e = i + e
        }
        t.__esModule = !0,
        t.supportStyle = t.console = t.VideoType = t.CDNPath = t.FullscreenApi = void 0,
        t.guid = n,
        t.bind = r,
        t.isEmpty = s,
        t.convertTime = a,
        t.doFullscreen = h,
        t.extend = d,
        t.store = f,
        t.compareVersion = y,
        t.escapeHTML = v,
        t.getFormat = A,
        t.unifyProtocol = m;
        for (var g = i(2), w = o(g), b = i(4), S = o(b), I = i(1), M = o(I), E = 1, _ = t.FullscreenApi = {
            requestFullscreen: null,
            exitFullscreen: null,
            fullscreenElement: null,
            fullscreenEnabled: null,
            fullscreenchange: null,
            fullscreenerror: null
        }, T = [["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"], ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"], ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitCurrentFullScreenElement", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitfullscreenerror"], ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"], ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]], C = T[0], D = void 0, L = 0; L < T.length; L++)
            if (T[L][1]in document) {
                D = T[L];
                break
            }
        if (D)
            for (var O = 0; O < D.length; O++)
                _[C[O]] = D[O];
        t.CDNPath = "https://cloudcache.tencent-cloud.com/open/qcloud/video/vcplayer/",
        t.VideoType = {
            RTMP: "rtmp",
            FLV: "flv",
            M3U8: "m3u8"
        },
        t.console = {
            log: function() {
                window.console && window.console.log.apply(window.console, arguments)
            },
            warn: function() {
                window.console && window.console.warn.apply(window.console, arguments)
            },
            error: function() {
                window.console && window.console.error.apply(window.console, arguments)
            }
        },
        t.supportStyle = function() {
            var e = document.createElement("div")
              , t = "Khtml O Moz Webkit".split(" ")
              , i = t.length;
            return function(o) {
                if (o in e.style)
                    return !0;
                if ("-ms-" + o in e.style)
                    return !0;
                for (o = o.replace(/^[a-z]/, function(e) {
                    return e.toUpperCase()
                }); i--; )
                    if (t[i] + o in e.style)
                        return !0;
                return !1
            }
        }()
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            var t = e.guid;
            return t ? (h[t] = h[t] || {},
            h[t]) : (console.error(e, " has no guid."),
            {})
        }
        function r(e) {
            var t = e.guid;
            return t ? (d[t] = d[t] || {},
            d[t]) : (console.error(e, " has no guid."),
            {})
        }
        function s(e, t) {
            a(e.type, e, t),
            a("*", e, t)
        }
        function a(e, t, i) {
            try {
                var o = n(i)
                  , s = r(i);
                if (!o[e])
                    return;
                var a = o[e];
                for (var l in a)
                    if (a.hasOwnProperty(l)) {
                        var c = a[l]
                          , u = s[l];
                        if ("function" != typeof u)
                            return !1;
                        for (var p = 0; p < c.length; p++) {
                            var h = c[p];
                            "*" !== h && h !== t.src || u(t)
                        }
                    }
            } catch (e) {
                window.console && console.error && console.error(e.stack || e)
            }
        }
        function l(e, t, i, o) {
            var s = n(o)
              , a = r(o);
            return i.guid ? (a[i.guid] = i,
            s[e] = s[e] || {},
            s[e][i.guid] = s[e][i.guid] || [],
            s[e][i.guid].push(t),
            i) : console.error("callback function need guid")
        }
        function c(e, t, i, o) {
            var s = n(o)
              , a = r(o);
            if (("*" == e || s[e]) && ("*" == e || s[e][i.guid]))
                for (var l in s)
                    if (("*" === e || l == e) && s.hasOwnProperty(l))
                        if ("*" !== i) {
                            var c = s[l][i.guid];
                            "*" === t && (c = []);
                            for (var u = 0; u < c.length; )
                                c[u] === t ? c.splice(u, 1) : u++;
                            0 == c.length && delete s[l][i.guid],
                            p.isEmpty(s[l]) && delete s[l]
                        } else {
                            for (var h in s[l])
                                delete a[h];
                            delete s[l]
                        }
        }
        t.__esModule = !0,
        t.MSG = void 0,
        t.pub = s,
        t.sub = l,
        t.unsub = c;
        var u = i(3)
          , p = o(u)
          , h = (t.MSG = {
            Error: "error",
            TimeUpdate: "timeupdate",
            Load: "load",
            MetaLoaded: "loadedmetadata",
            Loaded: "loadeddata",
            Progress: "progress",
            FullScreen: "fullscreen",
            Play: "play",
            Playing: "playing",
            Pause: "pause",
            Ended: "ended",
            Seeking: "seeking",
            Seeked: "seeked",
            Resize: "resize",
            VolumeChange: "volumechange",
            WebRTCStatUpdate: "webrtcstatupdate",
            WebRTCWaitStart: "webrtcwaitstart",
            WebRTCWaitEnd: "webrtcwaitend",
            WebRTCPullSuccess: "webrtcpullsuccess",
            WebRTCPullStart: "webrtcpullstart",
            WebRTCChange: "webrtcchange"
        },
        {})
          , d = {}
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function n(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        t.__esModule = !0,
        t.Player = t.dom = t.util = t.browser = t.MSG = void 0,
        i(6);
        var s = i(1)
          , a = n(s)
          , l = i(2)
          , c = n(l)
          , u = i(3)
          , p = n(u)
          , h = i(4)
          , d = n(h)
          , f = i(23)
          , y = o(f)
          , v = i(26)
          , A = o(v)
          , m = i(27)
          , g = o(m)
          , w = i(35)
          , b = o(w)
          , S = i(36)
          , I = o(S)
          , M = i(37)
          , E = o(M)
          , _ = i(38)
          , T = o(_);
        window.console || (window.console = {
            log: function() {},
            error: function() {},
            debug: function() {},
            info: function() {}
        });
        var C = t.MSG = d.MSG
          , D = t.browser = a
          , L = t.util = p
          , O = t.dom = c;
        t.Player = function() {
            function e(t) {
                r(this, e),
                this.options = t,
                this.ready = !1,
                this.hasPlay = !1;
                var i = t.owner;
                return i ? (this.guid = L.guid(),
                this.listener = this.options.listener,
                d.sub("*", "*", L.bind(this, this.handleMsg), this),
                i = O.get(i),
                void this.render(i)) : console.error("Player need a container")
            }
            return e.prototype.render = function(e) {
                var t = "vcp-player";
                if (D.TOUCH_ENABLED && (t += " touchable"),
                this.el = O.createEl("div", {
                    class: t
                }),
                e.appendChild(this.el),
                this.errortips = new T["default"](this),
                this.errortips.render(this.el),
                this.loading = new E["default"](this),
                this.loading.render(this.el),
                this.options.width = this.options.width || e.offsetWidth,
                this.options.height = this.options.height || e.offsetHeight,
                this.size(this.options.width, this.options.height),
                !this.verifyOptions())
                    return this.listener({
                        type: "error",
                        code: 5
                    }),
                    L.console.error("create failed");
                if (!this.options.flash && D.HASVIDEO) {
                    var i = new y["default"](this);
                    i.render(this.el),
                    this.video = i
                } else {
                    var o = new A["default"](this);
                    o.render(this.el),
                    this.video = o
                }
                if (!this.video)
                    return L.console.error("create video failed");
                this.poster = new I["default"](this),
                this.poster.render(this.el),
                (D.IS_SAFARI && parseInt(D.SAFARI_VERSION) > 10 || D.IOS_VERSION > 10 || D.IS_PCWECHAT) && "system" == this.options.controls || (this.bigplay = new b["default"](this),
                this.bigplay.render(this.el));
                var n = void 0;
                n = !(this.options.controls && "default" != this.options.controls && (!this.options.flash || "system" != this.options.controls)),
                n && (this.panel = new g["default"](this),
                this.panel.render(this.el)),
                this.setup()
            }
            ,
            e.prototype.verifyOptions = function() {
                return D.IE_VERSION && L.compareVersion(D.IE_VERSION, "8.0") == -1 ? (this.errortips.show({
                    code: 5
                }),
                !1) : !!this.options.src || (this.options.videoSource.hasUrl() ? D.IS_IE || !D.IS_ENABLED_FLASH ? this.errortips.show({
                    code: 5
                }) : this.errortips.show({
                    code: 5
                }) : this.errortips.show({
                    code: 12
                }),
                !1)
            }
            ,
            e.prototype.size = function(e, t, i) {
                i = i || "cover";
                var o = /^\d+\.?\d{0,2}%$/
                  , n = void 0
                  , r = void 0;
                if (o.test(e) || o.test(t))
                    n = e,
                    r = t;
                else {
                    var s = this.video ? this.video.videoWidth() : this.options.width
                      , a = this.video ? this.video.videoHeight() : this.options.height;
                    if (n = e,
                    r = t,
                    s && a) {
                        var l = s / a;
                        "fit" == i && (n = e,
                        r = n / l,
                        r > t && (n *= t / r,
                        r = t))
                    }
                    var c = O.getViewportSize();
                    c.width > 0 && n > c.width && (n = c.width)
                }
                n += o.test(n) ? "" : "px",
                r += o.test(r) ? "" : "px",
                this.el.style.width = n,
                this.el.style.height = r,
                this.video && (this.video.width(n),
                this.video.height(r)),
                this.width = n,
                this.height = r
            }
            ,
            e.prototype.setup = function() {
                if (this.__handleEvent = L.bind(this, this.handleEvent),
                D.IS_MOBILE) {
                    if (this.options.autoplay) {
                        var e = this;
                        document.addEventListener("WeixinJSBridgeReady", function() {
                            e.play()
                        })
                    }
                } else
                    this.loading.show()
            }
            ,
            e.prototype.destroy = function() {
                this.video && this.video.destroy(),
                this.panel && this.panel.destroy(),
                this.bigplay && this.bigplay.destroy(),
                this.loading && this.loading.destroy(),
                d.unsub("*", "*", this.handleMsg, this),
                this.video = this.panel = this.bigplay = this.loading = null,
                this.el.parentNode?.removeChild(this.el)
            }
            ,
            e.prototype.setListener = function(e) {
                this.listener = e
            }
            ,
            e.prototype.handleEvent = function(e) {
                switch (e.type) {
                case "mousemove":
                    if (this.__lastmove && new Date - this.__lastmove < 100)
                        break;
                    var t = this;
                    if (this.__movecnt = this.__movecnt || 0,
                    this.__movecnt++,
                    this.__movecnt < 5) {
                        setTimeout(function() {
                            t.__movecnt = 0
                        }, 500);
                        break
                    }
                    this.__movecnt = 0,
                    this.__lastmove = +new Date,
                    clearTimeout(this.__moveid),
                    t.panel && t.panel.show(),
                    this.__moveid = setTimeout(function() {
                        t.playing() && t.panel && t.panel.hide()
                    }, 3e3)
                }
            }
            ,
            e.prototype.handleMsg = function(e) {
                switch (e.type) {
                case C.Load:
                    O.removeClass(this.el, "vcp-playing"),
                    ("none" === this.options.preload || this.options.hlsConfig && this.options.hlsConfig.autoStartLoad === !1) && this.loading.hide();
                    break;
                case C.Play:
                    if (!this.playing())
                        break;
                    !this.hasPlay && this.options.flash && (this.hasPlay = !0),
                    O.addClass(this.el, "vcp-playing"),
                    this.video.type() == L.VideoType.RTMP && (this.__wait = !0,
                    this.loading.show()),
                    O.on(this.el, "mousemove", this.__handleEvent);
                    break;
                case C.Playing:
                    this.loading.hide();
                    break;
                case C.TimeUpdate:
                    this.__wait && (this.__wait = !1,
                    this.loading.hide());
                    break;
                case C.Pause:
                    O.off(this.el, "mousemove", this.__handleEvent),
                    O.removeClass(this.el, "vcp-playing");
                    break;
                case C.Ended:
                    O.off(this.el, "mousemove", this.__handleEvent),
                    this.panel && this.panel.show(),
                    O.removeClass(this.el, "vcp-playing");
                    break;
                case C.MetaLoaded:
                    this.loading.hide(),
                    this.size(this.options.width, this.options.height);
                    break;
                case C.Seeking, C.WebRTCWaitStart:
                    this.loading.show();
                    break;
                case C.Seeked, C.WebRTCWaitEnd:
                    this.loading.hide();
                    break;
                case C.FullScreen:
                    var t = this;
                    setTimeout(function() {
                        O.toggleClass(t.el, "vcp-fullscreen", e.detail.isFullscreen)
                    }, 0);
                    break;
                case C.Error:
                    this.loading.hide(),
                    this.errortips.show(e.detail),
                    this.panel && this.panel.show();
                    try {
                        var i = this.options.videoSource
                          , o = L.getFormat(i);
                        D.IS_X5TBS ? MtaH5.clickStat("x5_err", {
                            format: o
                        }) : MtaH5.clickStat("error", {
                            format: o
                        })
                    } catch (e) {}
                }
                !e["private"] && this.listener && this.listener(e)
            }
            ,
            e.prototype.currentTime = function(e) {
                return this.video.currentTime(e)
            }
            ,
            e.prototype.duration = function() {
                return this.video.duration()
            }
            ,
            e.prototype.percent = function(e) {
                return this.video.duration() ? "undefined" == typeof e ? this.video.currentTime() / this.video.duration() : void this.video.currentTime(this.video.duration() * e) : 0
            }
            ,
            e.prototype.buffered = function() {
                return this.video.duration() ? this.video.buffered() / this.video.duration() : 0
            }
            ,
            e.prototype.pause = function() {
                this.video?.pause()
            }
            ,
            e.prototype.play = function() {
                var e;
                this.errortips.clear(),
                (e = this.video).play.apply(e, arguments)
            }
            ,
            e.prototype.togglePlay = function() {
                this.errortips.clear(),
                this.video?.togglePlay()
            }
            ,
            e.prototype.stop = function() {
                this.video?.stop()
            }
            ,
            e.prototype.mute = function(e) {
                return this.video?.mute(e)
            }
            ,
            e.prototype.volume = function(e) {
                return this.video?.volume(e)
            }
            ,
            e.prototype.fullscreen = function(e) {
                return this.video?.fullscreen(e)
            }
            ,
            e.prototype.load = function(e, t) {
                this.errortips.clear(),
                this.loading.show(),
                this.video?.load(e || this.options.src, t)
            }
            ,
            e.prototype.playing = function() {
                return this.video && this.video.playing()
            }
            ,
            e.prototype.paused = function() {
                return this.video && this.video.paused()
            }
            ,
            e
        }()
    }
    , function(e, t, i) {
        var o = i(7);
        "string" == typeof o && (o = [[e.id, o, ""]]);
        i(22)(o, {});
        o.locals && (e.exports = o.locals)
    }
    , function(e, t, i) {
        t = e.exports = i(8)(),
        t.push([e.id, ".vcp-player{position:relative;z-index:0;font-family:Tahoma,\\\\5FAE\\8F6F\\96C5\\9ED1,\\u5b8b\\u4f53,Verdana,Arial,sans-serif;background-color:#000}.vcp-player video{display:block;overflow:hidden}.vcp-fullscreen.vcp-player,.vcp-fullscreen video,body.vcp-full-window{width:100%!important;height:100%!important}body.vcp-full-window{overflow-y:auto}.vcp-full-window .vcp-player{position:fixed;left:0;top:0;z-index:2147483647}.vcp-pre-flash,.vcp-video{width:100%;height:100%}.vcp-pre-flash{z-index:999;background:#000;position:absolute;top:0;left:0}.vcp-controls-panel{position:absolute;bottom:0;width:100%;font-size:16px;height:3em;z-index:1000}.vcp-controls-panel.show{animation:fadeIn ease .8s;animation-fill-mode:forwards;-webkit-animation-fill-mode:forwards}.vcp-controls-panel.hide{animation:fadeOut ease .8s;animation-fill-mode:forwards;-webkit-animation-fill-mode:forwards}.vcp-panel-bg{width:100%;height:100%;position:absolute;left:0;top:0;background-color:#242424;opacity:.8;filter:alpha(opacity=80);z-index:1000}.vcp-playtoggle{cursor:pointer;position:relative;z-index:1001;width:3em;height:100%;float:left;background-image:url(" + i(9) + ");background-image:url(" + i(10) + ")\\0}.vcp-playtoggle:focus,.vcp-playtoggle:hover{background-color:#708090;opacity:.9;filter:alpha(opacity=90)}.touchable .vcp-playtoggle:hover{background-color:transparent;opacity:1}.vcp-playing .vcp-playtoggle{background-image:url(" + i(11) + ");background-image:url(" + i(12) + ")\\0}.vcp-bigplay{width:100%;height:80%;position:absolute;background-color:white\\0;filter:alpha(opacity=0);opacity:0;z-index:1000;top:0;left:0}.vcp-slider{position:relative;z-index:1001;float:left;background:#c4c4c4;height:10px;opacity:.8;filter:alpha(opacity=80);cursor:pointer}.vcp-slider .vcp-slider-track{width:0;height:100%;margin-top:0;opacity:1;filter:alpha(opacity=100);background-color:#1e90ff}.vcp-slider .vcp-slider-thumb{cursor:pointer;background-color:#fff;position:absolute;top:0;left:0;border-radius:1em!important;height:10px;margin-left:-5px;width:10px}.vcp-slider-vertical{position:relative;width:.5em;height:8em;top:-5.6em;z-index:1001;background-color:#1c1c1c;opacity:.9;filter:alpha(opacity=90);cursor:pointer}.vcp-slider-vertical .vcp-slider-track{background-color:#1275cf;width:.5em;height:100%;opacity:.8;filter:alpha(opacity=80)}.vcp-slider-vertical .vcp-slider-thumb{cursor:pointer;position:absolute;background-color:#f0f8ff;width:.8em;height:.8em;border-radius:.8em!important;margin-top:-.4em;top:0;left:-.15em}.vcp-timeline{top:-10px;left:0;height:10px;position:absolute;z-index:1001;width:100%}.vcp-timeline .vcp-slider-thumb{top:-4px}.vcp-timeline .vcp-slider{margin-top:8px;height:2px;width:100%}.vcp-timeline:hover .vcp-slider{margin-top:0;height:10px}.vcp-timeline:hover .vcp-slider-thumb{display:block;width:16px;height:16px;top:-3px;margin-left:-8px}.vcp-timelabel{display:inline-block;line-height:3em;float:left;color:#fff;padding:0 9px}.vcp-timelabel,.vcp-volume{height:3em;z-index:1001;position:relative}.vcp-volume{width:3em;cursor:pointer;float:right;background-color:transparent;opacity:.9;filter:alpha(opacity=90)}.vcp-volume-icon{background-image:url(" + i(13) + ");background-image:url(" + i(14) + ")\\0;display:inline-block;width:3em;height:3em;position:absolute;left:0;top:0}.vcp-volume-muted .vcp-volume-icon{background-image:url(" + i(15) + ");background-image:url(" + i(16) + ")\\0}.vcp-volume .vcp-slider-vertical{top:-8.4em;left:1em;display:none}.vcp-volume .vcp-slider-track{position:absolute;bottom:0}.vcp-volume:hover .vcp-slider-vertical{display:block}.vcp-volume .vcp-volume-bg{height:8.8em;width:2em;position:absolute;left:.25em;top:-8.8em;background:#242424;display:none}.vcp-volume:hover .vcp-slider-vertical,.vcp-volume:hover .vcp-volume-bg{display:block}.vcp-fullscreen-toggle{position:relative;width:3em;height:3em;float:right;cursor:pointer;z-index:1001;background-image:url(" + i(17) + ");background-image:url(" + i(18) + ")\\0}.vcp-fullscreen .vcp-fullscreen-toggle{background-image:url(" + i(19) + ");background-image:url(" + i(20) + ')\\0}.vcp-loading{box-sizing:border-box;background-clip:padding-box;width:50px;height:50px;display:none;position:absolute;top:50%;left:50%;margin:-25px 0 0 -25px;text-indent:-9999em}.vcp-loading:before{box-sizing:inherit;content:"";display:block;width:100%;height:100%;border-radius:50%;border:3px solid hsla(0,0%,100%,0);border-left-color:#fff;border-right-color:#fff;transform:translateZ(0);animation:load8 1.1s infinite linear}@keyframes load8{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.vcp-poster{position:absolute;left:0;top:0;overflow:hidden;z-index:1000;width:100%;height:100%;display:none}.vcp-poster-pic{position:relative}.vcp-poster-pic.cover,.vcp-poster-pic.default{left:50%;top:50%;transform:translate(-50%,-50%)}.vcp-poster-pic.cover{width:100%}.vcp-poster-pic.stretch{width:100%;height:100%}.vcp-error-tips{position:absolute;z-index:1001;width:100%;height:4.5em;left:0;top:50%;color:#ff4500;margin-top:-5.25em;text-align:center;display:none}.vcp-clarityswitcher{height:3em;width:3em;cursor:pointer;position:relative;z-index:1001;float:right;background-color:transparent;opacity:.9}.vcp-vertical-switcher-container{width:3em;position:absolute;left:0;bottom:2.4em;background:#242424;display:none}.vcp-vertical-switcher-current{display:block;color:#fff;text-align:center;line-height:3em}.vcp-vertical-switcher-item{display:block;color:#fff;text-align:center;line-height:2em}.vcp-vertical-switcher-item.current{color:#888}.vcp-share>a{width:3em;height:3em;cursor:pointer;background-image:url(' + i(21) + ");opacity:.9;display:block}.vcp-share{width:3em;height:3em;position:relative;float:right;z-index:1001}.vcp-vertical-share-container{width:auto;height:auto;position:absolute;background:rgba(36,36,36,.8);padding:.5em;overflow:hidden;display:none}@keyframes fadeOut{0%{opacity:1}to{opacity:0}}.fadeOut{animation:fadeOut ease .8s;animation-fill-mode:forwards;-webkit-animation-fill-mode:forwards}@keyframes fadeIn{0%{opacity:0}to{opacity:1}}.fadeIn{animation:fadeIn ease .8s;animation-fill-mode:forwards;-webkit-animation-fill-mode:forwards}", ""]);
    }
    , function(e, t) {
        e.exports = function() {
            var e = [];
            return e.toString = function() {
                for (var e = [], t = 0; t < this.length; t++) {
                    var i = this[t];
                    i[2] ? e.push("@media " + i[2] + "{" + i[1] + "}") : e.push(i[1])
                }
                return e.join("")
            }
            ,
            e.i = function(t, i) {
                "string" == typeof t && (t = [[null, t, ""]]);
                for (var o = {}, n = 0; n < this.length; n++) {
                    var r = this[n][0];
                    "number" == typeof r && (o[r] = !0)
                }
                for (n = 0; n < t.length; n++) {
                    var s = t[n];
                    "number" == typeof s[0] && o[s[0]] || (i && !s[2] ? s[2] = i : i && (s[2] = "(" + s[2] + ") and (" + i + ")"),
                    e.push(s))
                }
            }
            ,
            e
        }
    }
    , function(e, t) {
        e.exports = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMzYgMzYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPHBhdGggZD0iTTExLDEwIEwxOCwxMy43NCAxOCwyMi4yOCAxMSwyNiBNMTgsMTMuNzQgTDI2LDE4IDI2LDE4IDE4LDIyLjI4IiBmaWxsPSIjZmZmIj48L3BhdGg+DQo8L3N2Zz4="
    }
    , function(e, t) {
        e.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAAAFoAAABaAHAjuH0AAAAHdElNRQfgBRQSOydLEdPXAAABmUlEQVRYw+2Wu0oDQRhGz2oIEhAtBEHRQpIIXtAH0M7Kd7DQQl/BV/BlFEEsBO9IUAmI8X5Bi6RQoqgYJYr5LMISE5LdmZhyT7mzO9/8Z3b/WQgICAjwxak9JLPbfGiqfwGNCBhkmj4cECqryJyQ52iMWeIccsI9eVfav4tyEZrSjwpKaUHj6lKLHFnXEvIZd3CI080k6yyRJGdryi8AIEyYdtoYZJ9NEnzYyDIJKM7VQw8DROnnmGseihJNY6oiNKWCyvnRq5Y1o6jaFXJ3xMuaaQUuTbQywSgXLLLGXeMU/ZUVoZcOOhljj23OXVnVVdkHFIkwwgBDxEhwRpq3OuaougeV5HWsefXX3ge/XmQiOezloV5FAN+cssEB52QaH/DBNanSJjcyQHySrXxNa39stgEF3tlimR2yvJs8YBfwRIJ1klzyWLro3SpMA0SaG5LssMuL2dTmAV/kyJS3a/MG5xcg4IpVVrjlmbz9uekdkOOILRKkikemuRgjhIY1p7ia7Q/KEn7/RY6t80r8elF9yw4ICAiw4xcxfsNvJiWE7gAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNi0wNS0yMFQxODo1OToxOCswODowMJKBy7cAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTYtMDUtMjBUMTg6NTk6MzkrMDg6MDAHjn/CAAAAPHRFWHRzdmc6YmFzZS11cmkAZmlsZTovLy9EOi9zcGFjZS92Y19wbGF5ZXIvc3JjL2ltZy9wbGF5X2J0bi5zdmedrkudAAAAAElFTkSuQmCC"
    }
    , function(e, t) {
        e.exports = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMzYgMzYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPHBhdGggZD0iTTExLDEwIEwxNywxMCAxNywyNiAxMSwyNiBNMjAsMTAgTDI2LDEwIDI2LDI2IDIwLDI2IiBmaWxsPSIjZmZmIj48L3BhdGg+DQo8L3N2Zz4="
    }
    , function(e, t) {
        e.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAAAFoAAABaAHAjuH0AAAAHdElNRQfgBRQTADNsu4KlAAAAfklEQVRYw+2WsQ2AMAwEPyiZimloWIqOhjHYg1VAMi1Ejo2l0P2VH/kvnQ0QQohLaj9Jl6ocnBInDwpGzI+qgh0LxMhjCGSSN5skaeY6g+m4qn+dTh4WdIACCiiggAIKfEGulntxcrXC4sBaLXc7V/DuosDZolf9fngRQsgHbrk8P6SPYKxbAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE2LTA1LTIwVDE5OjAwOjI0KzA4OjAwi3r4LQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNi0wNS0yMFQxOTowMDo1MSswODowMKLaZi8AAAA8dEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL0Q6L3NwYWNlL3ZjX3BsYXllci9zcmMvaW1nL3N0b3BfYnRuLnN2Z0xvOgsAAAAASUVORK5CYII="
    }
    , function(e, t) {
        e.exports = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMzYgMzYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPHBhdGggZD0iTTEyLjM5LDE1LjU0IEwxMCwxNS41NCBMMTAsMjAuNDQgTDEyLjQsMjAuNDQgTDE3LDI1LjUwIEwxNywxMC40OCBMMTIuMzksMTUuNTQgWiIgb3BhY2l0eT0iMSIgZmlsbD0iI2ZmZiI+PC9wYXRoPg0KICAgIDxwYXRoIGQ9Ik0xMi4zOSwxNS41NCBMMTAsMTUuNTQgTDEwLDIwLjQ0IEwxMi40LDIwLjQ0IEwxNywyNS41MCBMMTcsMTAuNDggTDEyLjM5LDE1LjU0IFoiIG9wYWNpdHk9IjEiIGZpbGw9IiNmZmYiPjwvcGF0aD4NCiAgICA8cGF0aCBkPSJNMjIsMTcuOTkgQzIyLDE2LjQgMjAuNzQsMTUuMDUgMTksMTQuNTQgTDE5LDIxLjQ0IEMyMC43NCwyMC45MyAyMiwxOS41OSAyMiwxNy45OSBaIiBvcGFjaXR5PSIxIiBmaWxsPSIjZmZmIj48L3BhdGg+DQogICAgPHBhdGggZD0iTTIyLDE3Ljk5IEMyMiwxNi40IDIwLjc0LDE1LjA1IDE5LDE0LjU0IEwxOSwyMS40NCBDMjAuNzQsMjAuOTMgMjIsMTkuNTkgMjIsMTcuOTkgWiIgb3BhY2l0eT0iMSIgZmlsbD0iI2ZmZiI+PC9wYXRoPg0KPC9zdmc+"
    }
    , function(e, t) {
        e.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAAAFoAAABaAHAjuH0AAAAHdElNRQfgBR8OMR9bwV7WAAABiElEQVRYw+2WvS9DURiHn9sSbUMrrTZSsYgYSATBIkRYLI0JsfkDjCb+B4mFxeJjNVsMEkwmMRhMNloShg5K+zO4lV4ft6e9DJL7nO3c97zPOe/JOeeCj4+PT1UsszDVPsQm8NcrMBLY84+T+BOBnT7CDFM11sckud2aNalT7cuS96TfCBo1qhNJe7ULGgyKAyOsMFTuKPeaVesHgWOewyyRqYhsp0juPaa6xG0FMSJAhGUWHHFjtHBEloK3ElnMMQF00EfIsbRp5jljjSuKXgQwwCwFmmn61B8lwTjLbHFRXeB2DmJEaSP0pdAlIMYs3SYlchPIdVySsFeBOyWzsECd30rckjcRuG1yjiwvtBL+pAoC9xxw7VVwToAgXfSTdmz0E3ccs2km+AEhFFVKKXVqQzm9sytLKKNFpdUoPFx8qmy9Wle+QpBUvPzNM3aiQe3o8UPwW8kdK+nRoV5//bqu4IZVgvVMsYrAwj7Qz1yyXU9djF6Nj0ff4qHW35b//1/k4+PjY8AbQVScfN4fNOAAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTYtMDUtMzFUMTQ6NDk6MDYrMDg6MDB87oydAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE2LTA1LTMxVDE0OjQ5OjMxKzA4OjAwRpsNTAAAADp0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vRDovc3BhY2UvdmNfcGxheWVyL3NyYy9pbWcvdm9sdW1uLnN2Z7m8k5MAAAAASUVORK5CYII="
    }
    , function(e, t) {
        e.exports = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMzYgMzYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPHBhdGggZD0iTTEyLjM5LDE1LjU0IEwxMCwxNS41NCBMMTAsMjAuNDQgTDEyLjQsMjAuNDQgTDE3LDI1LjUwIEwxNywxMC40OCBMMTIuMzksMTUuNTQgWiIgb3BhY2l0eT0iMSIgZmlsbD0iI2ZmZiI+PC9wYXRoPg0KICAgIDxwYXRoIGQ9Ik0xMi4zOSwxNS41NCBMMTAsMTUuNTQgTDEwLDIwLjQ0IEwxMi40LDIwLjQ0IEwxNywyNS41MCBMMTcsMTAuNDggTDEyLjM5LDE1LjU0IFoiIG9wYWNpdHk9IjEiIGZpbGw9IiNmZmYiPjwvcGF0aD4NCiAgICA8cGF0aCBkPSJNMTkuNjMsMTUuOTIgTDIwLjY4LDE0LjkzIEwyMi44MSwxNi45NCBMMjQuOTQsMTQuOTMgTDI2LDE1LjkyIEwyMy44NiwxNy45MyBMMjYsMTkuOTMgTDI0Ljk0LDIwLjkyIEwyMi44MSwxOC45MiBMMjAuNjgsMjAuOTIgTDE5LjYzLDE5LjkzIEwyMS43NiwxNy45MyBMMTkuNjMsMTUuOTIgWiIgb3BhY2l0eT0iMSIgZmlsbD0iI2ZmZiI+PC9wYXRoPg0KICAgIDxwYXRoIGQ9Ik0xOS42MywxNS45MiBMMjAuNjgsMTQuOTMgTDIyLjgxLDE2Ljk0IEwyNC45NCwxNC45MyBMMjYsMTUuOTIgTDIzLjg2LDE3LjkzIEwyNiwxOS45MyBMMjQuOTQsMjAuOTIgTDIyLjgxLDE4LjkyIEwyMC42OCwyMC45MiBMMTkuNjMsMTkuOTMgTDIxLjc2LDE3LjkzIEwxOS42MywxNS45MiBaIiBvcGFjaXR5PSIxIiBmaWxsPSIjZmZmIj48L3BhdGg+DQo8L3N2Zz4="
    }
    , function(e, t) {
        e.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAAAFoAAABaAHAjuH0AAAAHdElNRQfgBR8OMx9p9zxUAAAB3UlEQVRYw+2Wz0sVURTHP+PMw3joG39jWRGFLpQnIhZBEGEEuZBoERK0aNUqWrXyL3AVtWjnKjVaqOBChKJV8UJatAgraBUkgo8Cn2kk8b4uHMN5zcybO+pCmM/ZnXvv+Z5z7g8upKSkpFTFijdN5ks8ag67glgCXv5NNB+KgBc+y3UGDfsTJ7hndbqit5qUpf0HDRDI6ILeSJowF3BiNAfO85D+XUeQRHjnQgR8QQa4y3D1VIJFopa5ZIEs9xnxzbNxaaBEiS0ytGNT4qd5iyxucRnooIdjvpFGbnOHlzznM6cZ4zgzPEamAtDHDbaoo7bC/xuHPC04fOci1yhGHd7oFuUC/ZssMs0QNylzkmXmKSQTUKi/wBqdDOBQosAUH8KDJHuLamnGxQEynKMhampUBWHiLle5xxnesU6ebh7gMhdWb1QFRVZZZoPyf2u6uMQSUzzlBb/oI5+sgvfUYHOWXk74zsk6X3nFLK9ZYZEyOb4YN1kI5dSmNp3SExW1wzNZQqheHcrJFrLVqnbVC8M3SnutW4+04RMINKM9sDwD4BMTTLNWOVZpifiXX5cW9PfAn+s9fGMUO0mKVQQsvAv9h4+Mm+7kboQYjQKgCYsfpt+Wo/8vSklJSYnBNtEBsGU3qz6oAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE2LTA1LTMxVDE0OjUxOjA1KzA4OjAwn18JNAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNi0wNS0zMVQxNDo1MTozMSswODowMJTCkngAAAA5dEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL0Q6L3NwYWNlL3ZjX3BsYXllci9zcmMvaW1nL211dGVkLnN2Z6SDmFIAAAAASUVORK5CYII="
    }
    , function(e, t) {
        e.exports = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMzYgMzYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPHBhdGggZD0iTTcsMTYgTDEwLDE2IEwxMCwxMyBMMTMsMTMgTDEzLDEwIEw3LDEwIEw3LDE2IFoiIG9wYWN0aXk9IjEiIGZpbGw9IiNmZmYiPjwvcGF0aD4NCiAgICA8cGF0aCBkPSJNMjMsMTAgTDIzLDEzIEwyNiwxMyBMMjYsMTYgTDI5LDE2IEwyOSwxMCBMMjMsMTAgWiIgb3BhY3RpeT0iMSIgZmlsbD0iI2ZmZiI+PC9wYXRoPg0KICAgIDxwYXRoIGQ9Ik0yMywyMyBMMjMsMjYgTDI5LDI2IEwyOSwyMCBMMjYsMjAgTDI2LDIzIEwyMywyMyBaIiBvcGFjdGl5PSIxIiBmaWxsPSIjZmZmIj48L3BhdGg+DQogICAgPHBhdGggZD0iTTEwLDIwIEw3LDIwIEw3LDI2IEwxMywyNiBMMTMsMjMgTDEwLDIzIEwxMCwyMCBaIiBvcGFjdGl5PSIxIiBmaWxsPSIjZmZmIj48L3BhdGg+DQo8L3N2Zz4="
    }
    , function(e, t) {
        e.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAAAFoAAABaAHAjuH0AAAAHdElNRQfgBR8TICc05PV7AAABZUlEQVRYw+2WPXKDMBSEPwXsg6TIJVxxEBcunEPFld04t6DiEi58EGyyKSAOED1JZCZFZrQVmtl9f/tGAjIyMjKicNOj0mgLuGVCNCtSErf0SPZU3EaSNxoj/IbXUYoVNYdgOSDkdNYUO1nc3Yx5lptznzzK2+zcmfV0EaWRYFQi0AWaFt2DZ6AMiA/UrJHpADTscLRU7L2LFkwANe+EceU6fO2Xd+BYY5U1EL5aZW0TfR70E+0iCzdVdCOlt4xx7A0vdIiGq4vGBsEzGxwFF5p5yMhVkZhgseY/4c9H5FvTkcmJZU5MjlQjp6Mk6a5t2p4KbXWXJB3TLru+x2LBOjgKa6Khu6j9nm/kRWvRb+6iCobLzvKin31LldyrkNNpeD4+9BHy4jH7nidJp58ehDqIe9HPPuiVz+TV7FyY6iKiNDqoYfLoX8wEF06zR98Ywyga3l8Rc4ui3NJSJmIJNyMjI8PCJz46uKC8JLnTAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE2LTA1LTMxVDE3OjQ1OjU3KzA4OjAwNY8FDQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNi0wNS0zMVQxOTozMjozOSswODowMOODzSEAAAA+dEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL0Q6L3NwYWNlL3ZjX3BsYXllci9zcmMvaW1nL2Z1bGxzY3JlZW4uc3ZnTGxUBwAAAABJRU5ErkJggg=="
    }
    , function(e, t) {
        e.exports = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMzYgMzYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQogICAgPGRlZnM+DQogICAgICAgIDxwYXRoIGQ9Ik0xMywxMCBMMTAsMTAgTDEwLDEzIEw3LDEzIEw3LDE2IEwxMywxNiBMMTMsMTAgWiIgaWQ9InN2Zy1xdWl0LTEiPjwvcGF0aD4NCiAgICAgICAgPHBhdGggZD0iTTI5LDE2IEwyOSwxMyBMMjYsMTMgTDI2LDEwIEwyMywxMCBMMjMsMTYgTDI5LDE2IFoiIGlkPSJzdmctcXVpdC0yIj48L3BhdGg+DQogICAgICAgIDxwYXRoIGQ9Ik0yOSwyMyBMMjksMjAgTDIzLDIwIEwyMywyNiBMMjYsMjYgTDI2LDIzIEwyOSwyMyBaIiBpZD0ic3ZnLXF1aXQtMyI+PC9wYXRoPg0KICAgICAgICA8cGF0aCBkPSJNMTAsMjYgTDEzLDI2IEwxMywyMCBMNywyMCBMNywyMyBMMTAsMjMgTDEwLDI2IFoiIGlkPSJzdmctcXVpdC00Ij48L3BhdGg+DQogICAgPC9kZWZzPg0KICAgIDx1c2Ugc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iLjE1IiBzdHJva2Utd2lkdGg9IjJweCIgeGxpbms6aHJlZj0iI3N2Zy1xdWl0LTEiPjwvdXNlPg0KICAgIDx1c2Ugc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iLjE1IiBzdHJva2Utd2lkdGg9IjJweCIgeGxpbms6aHJlZj0iI3N2Zy1xdWl0LTIiPjwvdXNlPg0KICAgIDx1c2Ugc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iLjE1IiBzdHJva2Utd2lkdGg9IjJweCIgeGxpbms6aHJlZj0iI3N2Zy1xdWl0LTMiPjwvdXNlPg0KICAgIDx1c2Ugc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iLjE1IiBzdHJva2Utd2lkdGg9IjJweCIgeGxpbms6aHJlZj0iI3N2Zy1xdWl0LTQiPjwvdXNlPg0KICAgIDx1c2UgZmlsbD0iI2ZmZiIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhsaW5rOmhyZWY9IiNzdmctcXVpdC0xIj48L3VzZT4NCiAgICA8dXNlIGZpbGw9IiNmZmYiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bGluazpocmVmPSIjc3ZnLXF1aXQtMiI+PC91c2U+DQogICAgPHVzZSBmaWxsPSIjZmZmIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeGxpbms6aHJlZj0iI3N2Zy1xdWl0LTMiPjwvdXNlPg0KICAgIDx1c2UgZmlsbD0iI2ZmZiIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhsaW5rOmhyZWY9IiNzdmctcXVpdC00Ij48L3VzZT4NCjwvc3ZnPg=="
    }
    , function(e, t) {
        e.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwEAQAAACtm+1PAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAAAFoAAABaAHAjuH0AAAAHdElNRQfgBR8RLwr1J2GvAAAFUklEQVRo3u2Yf0iUdxzHX889z915levSmBbpNS8NlSCcrY7+iJq2H8ZNYQwyguZYMBhBUK1iKeWgX46xGAaFzWEYtYHXUZJaiTB2mSaCTSG7QpPVxJbN8rzHu/vuj9PSqfeczkHBveD55/l+vu/v5/P9fD7P830eiBAhQoQIESK8HhjDtJNmODaTtaaHdBcnKDtBuQCKFZR0UFaAMiRb5JwwFzYGbZWhkbnpI1oXQNkZXCN8lOkYi2VKPQvilxryDANKGjE48fAQn/c45f7cv09CXw7QpiGT4u9acFJ2vFFu3I2PRcjYifG1M6BWqUvFskf14PtfEgAoFwwFSWUtK4pq+lKqE3tPXXT3xjuKKwe3xEHsALAqDJFVEDtQObglrjfeUdx76qK7L6U6sWVFUY2hIKksmInZYZJykLPmlCbF9CVUJ4sxNBXuN4N5LZAZhm4mmNc2Fe43j9XoS6hOnlOaFANyVni+BNGFWMg7vublLFAKPFbRFrCrZS+smkVH4JJ/JZA9jc3JDlzyr6RZdIzeCNjVMo9VtIFSMLLW2J7wTiUUsgfG1XwmLR6r+MncYLgvZTF3Gs6GhZTFXHOD4X5/zeJ1Jrf0pa85vJ7QamKbIc8wcKNp65LEutWxAbvqlrKYO/9ExhC5sxvA/BMZQ3d2HDUJJ26d0xDbbW5csiavokc9gw34bqYB7FPSiEn8dfWfsd0fdL24mws8o4550yqbqXlGnf56QvZCEoLaP3CH5ViUtIo4Ff4KNVWnIR2FE09g13D9hJFR59MlD5vIBzzTcDk4J13yjNMaQ2DXcD1OPEBUKCGtDOh4iI9CUcnnfD226V44Xx54IDYLG4fon0YAsWKzsFEecLNNB78L07jRTCmVQlFJNH4tH7UCaPIep/zqxp+LkotufjvytHnJJvLFZmG7fKD1XTBY0c5ocFMwVF0+0FpC8b5r0hHJxSUqxxlskls773UZvbUcJJdtobIQ8mwiW+Qcf9eCkyAWgP99Jj4qPUAsGKr0Nu+nw66nh4H7GgG8pbfN3zfsMv4Iah7wGDD9y6YO5CsgPZEtT77wd/kvzyiAkXHDyM4KDTsfMBxGBgD0BLOvpRkA1FB24aT8lSZkD8gW+cPXvISUIdmRWF6x0VaUfMTiDdXExb+0WqHXD9zUCOAdeFM+8PFKd07xymvSuSmaeG+XcWut66A/t3sb+KKYGcqKOclJqb3xjuLgqS3QPu4aFLdEqd9xo2NPG5iPEf5h7tiNjj1totTvEIPi1gRdIURvvKN4TnJSavCbIYSHGosFWITMbik/uLSUOsFimw7piOQiWArh8lg6J7nYq3sbExlkTlIIh6R8znKeTgKhhLSaeAg7Jl2Jfv2EkWfUAcGXULAETIRPcM7oC2xUa6xjJfr12DEBQ6GEtDJw2NfOQLexcQmJpATsatnoYU5/PWF2zkEA88ge3vDgt6c7WqLEVZ7rnIbPus2Np33t9ADRwCczDcClVqlL1+RV9CiZFY89VmE1Nxju39lx1LSQhFnzH+DpjpaolKavPP121WpKlx77mulRq9RnwO0ZZ0C661svlj2qV89gU8+IDFAa+msWrxNO3LN9nBZXed5vV63ivT8aBvFlgBQN3A76MPVxOhSvxSdlqAxM8hknbfc1M9BtblzCciyBXcP1FIrKzntdRg7JV4ANYQQggXylc2/XMsuii99wSMrXlejXd5sbT/ua6RnZ+avavmgHMBkveyKtIo6zfEQ0fm8tB0F6gsYTY4QhkJ5srXUdNEa7vucs59lOnK89vJr/T7yKP7amw+v/azFChAgRIkSIMMv8A/Qifkc5vn6XAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE2LTA1LTMxVDE3OjQ2OjUxKzA4OjAwvWiLNAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNi0wNS0zMVQxNzo0NzoxMCswODowMAHKXfgAAABDdEVYdHN2ZzpiYXNlLXVyaQBmaWxlOi8vL0Q6L3NwYWNlL3ZjX3BsYXllci9zcmMvaW1nL2Z1bGxzY3JlZW5fZXhpdC5zdmeq7hYiAAAAAElFTkSuQmCC"
    }
    , function(e, t) {
        e.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAjVJREFUeNrsmDtoFUEUhr+rJkiCSEyRQhHRCCohBAlioRIECxtBQRBL8VHYWFmIhXaijY2gRCGIFlbpLASFYDAiPoiPYFBBRBQFkRA0PmI+m3MhhORe3ZDNXpgfplh2mZlv5/zn7NmSSi1rATWuBJAAEkACSAAJIAHMpxbluFYbcBDYCiwBvgODQDdwD5jINKuax+hSB51ew+p+tS7L3HlsvlW9b2UNqGuyzJ+HBzqBjVWeaQIai2ri31XiewK4BbwvmgdK6k71tjo+Q+j8UbvVlqzrlOagIysBHcAxYDfwDOgB1sV1c5zKa+B63BvNvNgsABqApcBIpESAlcBh4Ehsqge4DHwIsPVAK/AtwD7P+m1lBNgCHAJWAa+AG8By4ATQAlwFLgIv5txhGeJuh/p2Six/UkfUXnVzTrUlUx1Yq/bPYMibakOem89SB9piTKePk7xQ2I+5p8CjCsWoqegAb4AzYdyyRoEnYezeSJUNeQFkzUKdwL54433AXWATcDJCrBc4D/RPU4UXR0odm0+AsuqiKJW1AjgAHI1TuAZcAJ4Dq4FdQHuc/BBwB3iYdxr9l9GhXlLH1CH1nNqn/pqUtcYjHR9XG/NKo/8z6tXtFdJuWT/V02pzUfuBveqPKhBf1FNF7Qfqw7SVtAzYVtR+4DEwXMt/JV4CZ4GvVSCvFLmpXxheeDAl9sej4emKZwrR0FRSO7AH2BAFbiCK3rv5KmTpz1wCSAAJIAEkgASQAGpZfwcAT9esWbDao2gAAAAASUVORK5CYII="
    }
    , function(e, t, i) {
        function o(e, t) {
            for (var i = 0; i < e.length; i++) {
                var o = e[i]
                  , n = d[o.id];
                if (n) {
                    n.refs++;
                    for (var r = 0; r < n.parts.length; r++)
                        n.parts[r](o.parts[r]);
                    for (; r < o.parts.length; r++)
                        n.parts.push(c(o.parts[r], t))
                } else {
                    for (var s = [], r = 0; r < o.parts.length; r++)
                        s.push(c(o.parts[r], t));
                    d[o.id] = {
                        id: o.id,
                        refs: 1,
                        parts: s
                    }
                }
            }
        }
        function n(e) {
            for (var t = [], i = {}, o = 0; o < e.length; o++) {
                var n = e[o]
                  , r = n[0]
                  , s = n[1]
                  , a = n[2]
                  , l = n[3]
                  , c = {
                    css: s,
                    media: a,
                    sourceMap: l
                };
                i[r] ? i[r].parts.push(c) : t.push(i[r] = {
                    id: r,
                    parts: [c]
                })
            }
            return t
        }
        function r(e, t) {
            var i = v()
              , o = g[g.length - 1];
            if ("top" === e.insertAt)
                o ? o.nextSibling ? i.insertBefore(t, o.nextSibling) : i.appendChild(t) : i.insertBefore(t, i.firstChild),
                g.push(t);
            else {
                if ("bottom" !== e.insertAt)
                    throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
                i.appendChild(t)
            }
        }
        function s(e) {
            e.parentNode.removeChild(e);
            var t = g.indexOf(e);
            t >= 0 && g.splice(t, 1)
        }
        function a(e) {
            var t = document.createElement("style");
            return t.type = "text/css",
            r(e, t),
            t
        }
        function l(e) {
            var t = document.createElement("link");
            return t.rel = "stylesheet",
            r(e, t),
            t
        }
        function c(e, t) {
            var i, o, n;
            if (t.singleton) {
                var r = m++;
                i = A || (A = a(t)),
                o = u.bind(null, i, r, !1),
                n = u.bind(null, i, r, !0)
            } else
                e.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (i = l(t),
                o = h.bind(null, i),
                n = function() {
                    s(i),
                    i.href && URL.revokeObjectURL(i.href)
                }
                ) : (i = a(t),
                o = p.bind(null, i),
                n = function() {
                    s(i)
                }
                );
            return o(e),
            function(t) {
                if (t) {
                    if (t.css === e.css && t.media === e.media && t.sourceMap === e.sourceMap)
                        return;
                    o(e = t)
                } else
                    n()
            }
        }
        function u(e, t, i, o) {
            var n = i ? "" : o.css;
            if (e.styleSheet)
                e.styleSheet.cssText = w(t, n);
            else {
                var r = document.createTextNode(n)
                  , s = e.childNodes;
                s[t] && e.removeChild(s[t]),
                s.length ? e.insertBefore(r, s[t]) : e.appendChild(r)
            }
        }
        function p(e, t) {
            var i = t.css
              , o = t.media;
            if (o && e.setAttribute("media", o),
            e.styleSheet)
                e.styleSheet.cssText = i;
            else {
                for (; e.firstChild; )
                    e.removeChild(e.firstChild);
                e.appendChild(document.createTextNode(i))
            }
        }
        function h(e, t) {
            var i = t.css
              , o = t.sourceMap;
            o && (i += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(o)))) + " */");
            var n = new Blob([i],{
                type: "text/css"
            })
              , r = e.href;
            e.href = URL.createObjectURL(n),
            r && URL.revokeObjectURL(r)
        }
        var d = {}
          , f = function(e) {
            var t;
            return function() {
                return "undefined" == typeof t && (t = e.apply(this, arguments)),
                t
            }
        }
          , y = f(function() {
            return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase())
        })
          , v = f(function() {
            return document.head || document.getElementsByTagName("head")[0]
        })
          , A = null
          , m = 0
          , g = [];
        e.exports = function(e, t) {
            t = t || {},
            "undefined" == typeof t.singleton && (t.singleton = y()),
            "undefined" == typeof t.insertAt && (t.insertAt = "bottom");
            var i = n(e);
            return o(i, t),
            function(e) {
                for (var r = [], s = 0; s < i.length; s++) {
                    var a = i[s]
                      , l = d[a.id];
                    l.refs--,
                    r.push(l)
                }
                if (e) {
                    var c = n(e);
                    o(c, t)
                }
                for (var s = 0; s < r.length; s++) {
                    var l = r[s];
                    if (0 === l.refs) {
                        for (var u = 0; u < l.parts.length; u++)
                            l.parts[u]();
                        delete d[l.id]
                    }
                }
            }
        }
        ;
        var w = function() {
            var e = [];
            return function(t, i) {
                return e[t] = i,
                e.filter(Boolean).join("\n")
            }
        }()
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
          , c = i(24)
          , u = n(c)
          , p = i(2)
          , h = o(p)
          , d = i(3)
          , f = o(d)
          , y = i(4)
          , v = i(25)
          , A = o(v)
          , m = i(1)
          , g = o(m)
          , w = {
            "0.7.1": "libs/hls.js",
            "0.7min": "libs/hls.min.js",
            "0.8.1": "libs/hls0.8.js",
            "0.8.9": "libs/hls.min.0.8.9.js",
            "0.12.4": "libs/hls.min.0.12.4.js"
        }
          , b = function(e) {
            function t(i) {
                return r(this, t),
                s(this, e.call(this, i, "H5Video"))
            }
            return a(t, e),
            t.prototype.render = function(t) {
                var i, o = this.player.options, n = "system" == o.controls ? "" : null, r = !!o.autoplay || null;
                return i = o.poster && "object" == l(o.poster) ? o.poster.src : "string" == typeof o.poster ? o.poster : null,
                this.createEl("video", {
                    controls: n,
                    preload: o.preload || "auto",
                    autoplay: r,
                    "webkit-playsinline": "",
                    playsinline: "",
                    "x-webkit-airplay": "allow",
                    "x5-video-player-type": "h5-page" == o.x5_type ? "h5-page" : null,
                    "x5-video-player-fullscreen": !!o.x5_fullscreen || null,
                    "x5-video-orientation": ["landscape", "portrait", "landscape|portrait"][o.x5_orientation] || null,
                    "x5-playsinline": 1 == !!o.x5_playsinline ? o.x5_playsinline : null,
                    "x5-mse-live-streaming": o.live ? "" : null
                }),
                this.el.style.width = this.player.width,
                this.el.style.height = this.player.height,
                0 === o.volume && (this.el.muted = !0),
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.__hlsLoaded = function(e) {
                if (!Hls.isSupported())
                    return this.notify({
                        type: "error",
                        code: 5,
                        timeStamp: +new Date
                    });
                this.clear();
                var t = new Hls(this.options.hlsConfig);
                t.loadSource(e),
                t.attachMedia(this.el),
                t.on(Hls.Events.MANIFEST_PARSED, function(e, t) {}),
                t.on(Hls.Events.MEDIA_DETACHED, function() {}),
                t.on(Hls.Events.ERROR, f.bind(this, this.__hlsOnError)),
                this.hls = t
            }
            ,
            t.prototype.__hlsOnManifestParsed = function(e, t) {
                this.metaDataLoaded = !0
            }
            ,
            t.prototype.__hlsOnError = function(e, t) {
                var i = t.type
                  , o = t.details
                  , n = t.fatal
                  , r = this.hls;
                if (n)
                    switch (i) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        o.indexOf("TimeOut") > 0 ? f.console.error("加载视频文件超时") : f.console.error("无法加载视频文件，请检查网络，以及视频文件是否允许跨域请求访问，m3u8文件是否存在 " + (t.response && t.response.status ? "netstatus:" + t.response.status : "")),
                        this.notify({
                            type: "error",
                            code: 2,
                            timeStamp: +new Date
                        }),
                        r.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        r.recoverMediaError();
                        break;
                    default:
                        r.destroy()
                    }
            }
            ,
            t.prototype.__webrtcLoaded = function(e) {
                var t = this
                  , i = !1
                  , o = this.player.options.webrtcConfig
                  , n = new TXLivePlayer;
                if (n.setPlayerView(this.el),
                o) {
                    o.streamType ? "video" === o.streamType ? n.setConfig({
                        receiveVideo: !0,
                        receiveAudio: !1
                    }) : "audio" === o.streamType ? n.setConfig({
                        receiveVideo: !1,
                        receiveAudio: !0
                    }) : n.setConfig({
                        receiveVideo: !0,
                        receiveAudio: !0
                    }) : n.setConfig({
                        receiveVideo: !0,
                        receiveAudio: !0
                    });
                    var r = o.connectRetryCount;
                    r && (+r >= 0 || +r < 11) && n.setConfig({
                        connectRetryCount: r
                    });
                    var s = o.connectRetryDelay;
                    s && +s > 0 && n.setConfig({
                        connectRetryDelay: s
                    })
                }
                var a = !1
                  , l = !1;
                try {
                    n.startPlay(e),
                    n.setPlayListener({
                        onPlayEvent: function(e, o) {
                            if (1006 === e) {
                                var n = {
                                    type: "webrtcstop",
                                    timeStamp: +new Date
                                };
                                return t.notify(n),
                                !1
                            }
                            if (1007 === e) {
                                var n = {
                                    type: y.MSG.WebRTCPullStart,
                                    timeStamp: +new Date,
                                    detail: o
                                };
                                return t.notify(n),
                                !1
                            }
                            if (1008 === e) {
                                var n = {
                                    type: y.MSG.WebRTCPullSuccess,
                                    timeStamp: +new Date,
                                    detail: o
                                };
                                return t.notify(n),
                                !1
                            }
                            if (1009 === e) {
                                var n = {
                                    type: "webrtcwaitstart",
                                    timeStamp: +new Date
                                };
                                return t.notify(n),
                                !1
                            }
                            if (1010 === e) {
                                var n = {
                                    type: "webrtcwaitend",
                                    timeStamp: +new Date
                                };
                                return t.notify(n),
                                !1
                            }
                            var n = {
                                type: "error"
                            };
                            return e === -2002 && (n.code = 2002),
                            e === -2001 || e === -2004 ? (t.__convertProtocol(t.options.src, t.options.m3u8 ? f.VideoType.M3U8 : ""),
                            !1) : (e === -2003 && /NotAllowedError/.test(o.message) && (a = !0),
                            e === -2005 ? !i && (i = !0,
                            t.__convertProtocol(t.options.src, t.options.m3u8 ? f.VideoType.M3U8 : ""),
                            !1) : void (n.code && (o && (n.reason = o.message),
                            n.timeStamp = +new Date,
                            t.notify(n))))
                        },
                        onPlayStats: function(e) {
                            var i = e && e.video && e.video.framesPerSecond;
                            t.notify({
                                type: y.MSG.WebRTCStatUpdate,
                                detail: e,
                                timeStamp: +new Date
                            }),
                            l || a && i > 0 && (t.notify({
                                type: "error",
                                code: 2005,
                                reason: "NotAllowedError",
                                timeStamp: +new Date
                            }),
                            l = !0)
                        }
                    }),
                    this.webrtc = n
                } catch (e) {
                    console.log("error: ", e.message)
                }
            }
            ,
            t.prototype.__flvLoaded = function(e) {
                if (!flvjs.isSupported())
                    return this.notify({
                        type: "error",
                        code: 5,
                        timeStamp: +new Date
                    });
                this.clear();
                var t = flvjs.createPlayer(Object.assign({
                    type: "mse",
                    isLive: this.player.options.live,
                    url: e
                }), this.options.flvConfig);
                t.attachMediaElement(this.el),
                t.on(flvjs.Events.ERROR, f.bind(this, function(e, t, i) {
                    var o = {
                        type: "error"
                    };
                    e == flvjs.ErrorTypes.NETWORK_ERROR && (o.code = 2),
                    e == flvjs.ErrorTypes.MEDIA_ERROR && (o.code = 1002),
                    e == flvjs.ErrorTypes.OTHER_ERROR,
                    o.timeStamp = +new Date,
                    this.notify(o)
                })),
                t.on(flvjs.Events.MEDIA_INFO, f.bind(this, function(e, t) {})),
                t.on(flvjs.Events.STATISTICS_INFO, f.bind(this, function(e, t) {})),
                this.flv = t,
                t.load()
            }
            ,
            t.prototype.setup = function() {
                this.playState = A.PlayStates.IDLE,
                this.seekState = A.SeekStates.IDLE,
                this.metaDataLoaded = !1,
                this.__timebase = +new Date,
                this.on(y.MSG.MetaLoaded, this.notify),
                this.on(y.MSG.Loaded, this.notify),
                this.on(y.MSG.Progress, this.notify),
                this.on(y.MSG.Play, this.notify),
                this.on(y.MSG.Playing, this.notify),
                this.on(y.MSG.Pause, this.notify),
                this.on(y.MSG.Error, this.notify),
                this.on(y.MSG.TimeUpdate, this.notify),
                this.on(y.MSG.Ended, this.notify),
                this.on(y.MSG.Seeking, this.notify),
                this.on(y.MSG.Seeked, this.notify),
                this.on(y.MSG.VolumeChange, this.notify),
                this.on("durationchange", this.notify),
                this.load(this.options.src, this.options.m3u8 ? f.VideoType.M3U8 : "")
            }
            ,
            t.prototype.destroy = function() {
                this.webrtc && this.webrtc.stopPlay(),
                e.prototype.destroy.call(this),
                this.hls && this.hls.destroy(),
                this.flv && this.flv.destroy()
            }
            ,
            t.prototype.notify = function(e) {
                var t = {
                    type: e.type,
                    src: this,
                    ts: +new Date,
                    timeStamp: e.timeStamp
                };
                switch (e.type) {
                case y.MSG.MetaLoaded:
                    this.metaDataLoaded = !0;
                    break;
                case y.MSG.Error:
                    var i = {
                        1: "MEDIA_ERR_ABORTED",
                        2: "MEDIA_ERR_NETWORK",
                        3: "MEDIA_ERR_DECODE",
                        4: "MEDIA_ERR_SRC_NOT_SUPPORTED"
                    };
                    t.detail = this.el && this.el.error || {
                        code: e.code
                    },
                    t.detail.reason = i[t.detail.code] || e.reason;
                    break;
                case y.MSG.Ended:
                    this.pause(),
                    this.playState = A.PlayStates.STOP;
                    break;
                case "durationchange":
                    0 != this.videoHeight() && (t.type = y.MSG.Resize);
                    break;
                case y.MSG.Playing:
                    this.playState = e.type.toUpperCase();
                    break;
                case y.MSG.Pause:
                    this.playState = A.PlayStates.PAUSED;
                    break;
                case y.MSG.Seeking:
                case y.MSG.Seeked:
                    this.seekState = e.type.toUpperCase();
                    break;
                case y.MSG.WebRTCStatUpdate:
                case y.MSG.WebRTCPullSuccess:
                case y.MSG.WebRTCPullStart:
                case y.MSG.WebRTCChange:
                    t.detail = e.detail
                }
                this.pub(t)
            }
            ,
            t.prototype.videoWidth = function() {
                return this.el.videoWidth
            }
            ,
            t.prototype.videoHeight = function() {
                return this.el.videoHeight
            }
            ,
            t.prototype.width = function(e) {
                return e ? void (this.el.style.width = e) : this.el.width
            }
            ,
            t.prototype.height = function(e) {
                return e ? void (this.el.style.height = e) : this.el.height
            }
            ,
            t.prototype.play = function() {
                return this.webrtcStoped ? (this.load(this.options.src, this.options.m3u8 ? f.VideoType.M3U8 : ""),
                this.webrtcStoped = !1,
                !1) : (this.options.hlsConfig && this.options.hlsConfig.autoStartLoad === !1 && this.hls && this.hls.startLoad(-1),
                void this.el.play())
            }
            ,
            t.prototype.togglePlay = function() {
                this.paused() ? this.play() : this.pause()
            }
            ,
            t.prototype.pause = function() {
                this.el.pause()
            }
            ,
            t.prototype.stop = function() {
                this.el.pause(),
                this.el.currentTime = 0,
                this.flv && this.flv.unload(),
                this.hls && this.hls.stopLoad(),
                this.webrtc && (this.webrtc.stopPlay(),
                this.webrtcStoped = !0)
            }
            ,
            t.prototype.paused = function() {
                return this.el.paused
            }
            ,
            t.prototype.buffered = function() {
                return this.el.buffered.length >= 1 ? this.el.buffered.end(this.el.buffered.length - 1) : 0
            }
            ,
            t.prototype.currentTime = function(e) {
                return "undefined" == typeof e ? this.el.currentTime : this.el.currentTime = e
            }
            ,
            t.prototype.duration = function() {
                return this.el.duration || 0
            }
            ,
            t.prototype.mute = function(e) {
                return "undefined" == typeof e ? this.el.muted : (this.volume(e ? 0 : this.__lastVol),
                this.el.muted = e)
            }
            ,
            t.prototype.volume = function(e) {
                return "undefined" == typeof e ? this.el.volume : (e < 0 && (e = 0),
                e > 1 && (e = 1),
                0 != e && (this.__lastVol = e),
                this.el.muted = 0 == e,
                this.options.volume = e,
                this.el.volume = e)
            }
            ,
            t.prototype.fullscreen = function(e) {
                return f.doFullscreen(this.player, e, this.owner)
            }
            ,
            t.prototype.load = function(e, t) {
                var i = this
                  , o = e.indexOf("webrtc://") > -1 || e.indexOf(".sdp") > -1;
                this.pub({
                    type: y.MSG.Load,
                    src: this,
                    ts: +new Date,
                    detail: {
                        src: e,
                        type: t
                    }
                }),
                o ? g.IS_ENABLED_WEBRTC.then(function(o) {
                    o ? "undefined" == typeof window.TXLivePlayer ? h.loadScript("TXLivePlayer", f.unifyProtocol("https://video.sdk.qcloudecdn.com/web/TXLivePlayer-1.2.2.min.js"), function(t) {
                        t && (window.TXLivePlayer = t),
                        i.clear(!0, function() {
                            i.__webrtcLoaded.call(i, e)
                        })
                    }) : i.clear(!0, function() {
                        i.__webrtcLoaded(e)
                    }) : i.__convertProtocol(e, t)
                })["catch"](function(o) {
                    i.__convertProtocol(e, t)
                }) : this.__load(e, t)
            }
            ,
            t.prototype.__convertProtocol = function(e, t) {
                g.IS_ENABLED_MSE || g.IS_UC ? (this.notify({
                    type: y.MSG.WebRTCChange,
                    code: 2006,
                    detail: {
                        target: "flv"
                    },
                    timeStamp: +new Date
                }),
                e.indexOf(".sdp") > -1 ? e = e.replace(".sdp", ".flv") : (e = e.replace("webrtc://", "https://").replace("?", ".flv?"),
                e.indexOf("?") === -1 && e.indexOf(".flv") === -1 && (e += ".flv")),
                this.__load(e, t)) : g.IS_IOS || g.IS_VIVO || g.IS_ONEPLUS_3010 || g.IS_ALIPAY ? (this.notify({
                    type: y.MSG.WebRTCChange,
                    code: 2006,
                    detail: {
                        target: "hls"
                    },
                    timeStamp: +new Date
                }),
                e.indexOf(".sdp") > -1 ? e = e.replace(".sdp", ".m3u8") : (e = e.replace("webrtc://", "https://").replace("?", ".m3u8?"),
                e.indexOf("?") === -1 && e.indexOf(".m3u8") === -1 && (e += ".m3u8")),
                this.__load(e, t)) : this.notify({
                    type: "error",
                    code: 2e3,
                    timeStamp: +new Date
                })
            }
            ,
            t.prototype.__load = function(e, t) {
                var i = e.indexOf(".m3u8") > -1 || t == f.VideoType.M3U8
                  , o = e.indexOf(".flv") > -1;
                if (!g.IS_ENABLED_MSE || !i && !o || g.IS_X5TBS && this.player.options.x5_player || i && g.IS_MAC && g.IS_SAFARI && !g.IS_IOS)
                    this.clear(),
                    this.__type = t,
                    this.el.src = e;
                else {
                    var n = this
                      , r = w[this.options.hls] || w["0.7.1"];
                    i ? (this.__type = f.VideoType.M3U8,
                    "undefined" == typeof window.Hls ? h.loadScript("Hls", f.unifyProtocol(f.CDNPath + r), function(t) {
                        t && (window.Hls = t),
                        n.__hlsLoaded.call(n, e)
                    }) : this.__hlsLoaded(e)) : o && (this.__type = f.VideoType.FLV,
                    "undefined" == typeof window.flvjs ? h.loadScript("flvjs", f.unifyProtocol("dist/mpegts_v1.7.1/mpegts.js"), function(t) {
                        t && (window.flvjs = t),
                        (window.flvjs = window.mpegts),
						flvjs.LoggingControl.enableAll = false,
                        n.__flvLoaded.call(n, e)
                    }) : this.__flvLoaded(e))
                }
            }
            ,
            t.prototype.clear = function(e, t) {
                return this.hls && (this.hls.stopLoad(),
                this.hls.detachMedia()),
                this.flv && (this.flv.unload(),
                this.flv.detachMediaElement()),
                e ? (this.webrtc ? this.webrtc.stopPlay().then(function() {
                    t && t()
                }) : t && t(),
                !1) : void (this.webrtc && this.webrtc.stopPlay())
            }
            ,
            t.prototype.playing = function() {
                return !this.el.paused
            }
            ,
            t.prototype.type = function() {
                return this.__type
            }
            ,
            t
        }(u["default"]);
        t["default"] = b
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function r(e, t) {
            return t + "_" + e
        }
        function s(e, t) {
            return t.guid && String(t.guid).indexOf("_") == -1 ? e + "_" + t.guid : t.guid
        }
        t.__esModule = !0;
        var a = i(2)
          , l = o(a)
          , c = i(3)
          , u = o(c)
          , p = i(4)
          , h = o(p)
          , d = i(1)
          , f = o(d)
          , y = function() {
            function e(t, i) {
                n(this, e),
                this.name = i,
                this.player = t,
                this.options = t.options,
                this.fnCache = {},
                this.guid = u.guid()
            }
            return e.prototype.createEl = function(e, t, i) {
                return this.el = l.createEl(e, t, i)
            }
            ,
            e.prototype.render = function(e) {
                return e && this.el && (this.owner = e,
                e.appendChild(this.el),
                this.setup()),
                this.el
            }
            ,
            e.prototype.on = function(e, t, i) {
                "string" == typeof e && (i = t,
                t = e,
                e = this.el),
                this.cbs = this.cbs || {};
                var o = s(this.guid, i)
                  , n = !o
                  , a = o && !this.fnCache[o];
                return n || a ? (i = u.bind(this, i, this.guid),
                this.fnCache[i.guid] = i,
                o = i.guid) : i = this.fnCache[o],
                l.on(e, t, i),
                this.cbs[r(o, t)] = {
                    guid: o,
                    el: e,
                    type: t
                },
                i
            }
            ,
            e.prototype.off = function(e, t, i) {
                "string" == typeof e && (i = t,
                t = e,
                e = this.el),
                f.IS_MOBILE && "click" == t && (t = "touchend");
                var o = s(this.guid, i);
                this.fnCache[o] && (i = this.fnCache[o]),
                l.off(e, t, i),
                delete this.cbs[r(o, t)]
            }
            ,
            e.prototype.pub = function(e) {
                var t = this;
                setTimeout(function() {
                    h.pub(e, t.player)
                }, 0)
            }
            ,
            e.prototype.sub = function(e, t, i) {
                h.sub(e, t, i, this.player)
            }
            ,
            e.prototype.unsub = function(e, t, i) {
                h.unsub(e, t, i, this.player)
            }
            ,
            e.prototype.handleMsg = function() {}
            ,
            e.prototype.setup = function() {}
            ,
            e.prototype.destroy = function() {
                if (this.handleMsg && this.unsub("*", "*", this.handleMsg),
                this.cbs) {
                    for (var e in this.cbs)
                        if (this.cbs.hasOwnProperty(e)) {
                            var t = this.cbs[e];
                            l.off(t.el, t.type, this.fnCache[t.guid]),
                            delete this.cbs[e]
                        }
                    this.fnCache = null,
                    this.cbs = null;
                    try {
                        this.el.pause && this.el.pause(),
                        this.el.parentNode.removeChild(this.el)
                    } catch (e) {}
                }
            }
            ,
            e
        }();
        t["default"] = y
    }
    , function(e, t) {
        "use strict";
        t.__esModule = !0;
        t.PlayStates = {
            IDLE: "IDLE",
            PLAYING: "PLAYING",
            PAUSED: "PAUSED",
            STOP: "STOP"
        },
        t.SeekStates = {
            IDLE: "IDLE",
            SEEKING: "SEEKING",
            SEEKED: "SEEKED"
        },
        t.ControlsStates = {
            DEFAULT: "default",
            NONE: "none",
            SYSTEM: ""
        }
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        function l(e) {
            return window.document[e] ? window.document[e] : navigator.appName.indexOf("Microsoft Internet") != -1 ? document.getElementById(e) : document.embeds && document.embeds[e] ? document.embeds[e] : void 0
        }
        t.__esModule = !0;
        var c = i(24)
          , u = n(c)
          , p = i(4)
          , h = i(2)
          , d = o(h)
          , f = i(3)
          , y = o(f)
          , v = i(25)
          , A = o(v)
          , m = i(1)
          , g = o(m)
          , w = function(e) {
            function t(i) {
                r(this, t);
                var o = s(this, e.call(this, i, "FlashVideo"))
                  , n = "vcpFlashCB_" + o.guid;
                return o.__flashCB = n,
                window[n] || (window[n] = function(e, t) {
                    t = t && t[0];
                    var i = window[n].fnObj && window[n].fnObj[t.objectID];
                    i && i(e, t)
                }
                ,
                window[n].fnObj = {}),
                o
            }
            return a(t, e),
            t.prototype.render = function(e) {
                this.__timebase = +new Date;
                var t = this.player.options
                  , i = y.unifyProtocol(t.flashUrl || "//cloudcache.tencent-cloud.com/open/qcloud/video/player/release/QCPlayer.swf")
                  , o = "opaque"
                  , n = "obj_vcplayer_" + this.player.guid
                  , r = this.__flashCB;
                this.__id = n;
                var s = d.createEl("div", {
                    class: "vcp-video"
                });
                s.innerHTML = '\n\t\t<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="" id="' + n + '" width="100%" height="100%">\n            <param name="movie"  value="' + i + '" />\n            <param name="quality" value="autohigh" />\n            <param name="swliveconnect" value="true" />\n            <param name="allowScriptAccess" value="always" />\n            <param name="bgcolor" value="#000" />\n            <param name="allowFullScreen" value="true" />\n            <param name="wmode" value="' + o + '" />\n            <param name="FlashVars" value="cbName=' + r + '" />\n\n            <embed src="' + i + '" width="100%" height="100%" name="' + n + '"\n                   quality="autohigh"\n                   bgcolor="#000"\n                   align="middle" allowFullScreen="true"\n                   allowScriptAccess="always"\n                   type="application/x-shockwave-flash"\n                   swliveconnect="true"\n                   wmode="' + o + '"\n                   FlashVars="cbName=' + r + '"\n                   pluginspage="http://www.macromedia.com/go/getflashplayer" >\n            </embed>\n        </object>\n\t\t',
                this.container = s,
                this.owner = e,
                this.owner.appendChild(s),
                this.cover = d.createEl("div", {
                    class: "vcp-pre-flash"
                }),
                this.owner.appendChild(this.cover),
                window[this.__flashCB].fnObj[this.__id] = y.bind(this, this.notify)
            }
            ,
            t.prototype.setup = function() {
                this.on("error", this.notify),
                this.playState = A.PlayStates.IDLE,
                this.seekState = A.SeekStates.IDLE,
                this.metaDataLoaded = !1
            }
            ,
            t.prototype.doPolling = function() {
                this.options.live || (clearInterval(this.__timer),
                this.__timer = setInterval(this.interval.bind(this), 1e3))
            }
            ,
            t.prototype.endPolling = function() {
                clearInterval(this.__timer)
            }
            ,
            t.prototype.interval = function() {
                var e;
                try {
                    e = this.el.getState()
                } catch (e) {
                    return void this.endPolling()
                }
                if (this.__m3u8) {
                    var t = this.currentTime() + e.bufferLength;
                    this.__buffered !== t && (this.__buffered = t,
                    this.pub({
                        type: p.MSG.Progress,
                        src: this,
                        ts: +new Date
                    })),
                    this.__buffered >= this.duration() && this.endPolling()
                } else
                    this.__rtmp || (this.__bytesloaded != e.bytesLoaded && (this.__bytesloaded = e.bytesLoaded,
                    this.pub({
                        type: p.MSG.Progress,
                        src: this,
                        ts: +new Date
                    })),
                    this.__bytesloaded >= this.__bytesTotal && this.endPolling())
            }
            ,
            t.prototype.destroy = function() {
                "undefined" != typeof this.el && "undefined" != typeof this.el.destroy && this.el.destroy(),
                this.endPolling(),
                delete window[this.__flashCB].fnObj[this.__id],
                e.prototype.destroy.call(this)
            }
            ,
            t.prototype.notify = function(e, t) {
                var i = {
                    type: e,
                    ts: +new Date
                };
                try {
                    switch (this.options.debug && this.pub({
                        type: i.type,
                        src: this,
                        ts: i.ts,
                        detail: y.extend({
                            debug: !0
                        }, t)
                    }),
                    i.type) {
                    case "ready":
                        if (this.el = l(this.__id),
                        this.setup(),
                        g.IS_FIREFOX) {
                            var o = this;
                            setTimeout(function() {
                                o.el.setAutoPlay(!!o.options.autoplay),
                                o.__timebase = new Date - t.time,
                                o.load(o.options.src)
                            }, 0)
                        } else {
                            try {
                                this.el.setAutoPlay(!!this.options.autoplay)
                            } catch (e) {
                                console.warn("Flash 调用失败，请检查Flash是否启用成功")
                            }
                            this.__timebase = new Date - t.time,
                            this.load(this.options.src)
                        }
                        return;
                    case "metaData":
                        i.type = p.MSG.MetaLoaded,
                        this.__videoWidth = t.videoWidth,
                        this.__videoHeight = t.videoHeight,
                        this.__duration = t.duration,
                        this.__bytesTotal = t.bytesTotal,
                        this.__prevPlayState = null,
                        this.__m3u8 = t.type === y.VideoType.M3U8,
                        this.__rtmp = t.type === y.VideoType.RTMP,
                        this.__type = t.type,
                        this.__metaloaded = !0,
                        this.metaDataLoaded = !0,
                        this.doPolling();
                        var o = this;
                        if (!o.cover)
                            break;
                        setTimeout(function() {
                            o.cover && (o.owner.removeChild(o.cover),
                            o.cover = null)
                        }, 500);
                        break;
                    case "playState":
                        this.playState = t.playState,
                        t.playState == A.PlayStates.PLAYING ? (this.__playing = !0,
                        this.__stopped = !1,
                        i.type = p.MSG.Play) : t.playState == A.PlayStates.PAUSED ? (this.__playing = !1,
                        this.__stopped = !1,
                        i.type = p.MSG.Pause) : t.playState == A.PlayStates.STOP ? (this.__playing = !1,
                        this.__stopped = !0,
                        i.type = p.MSG.Ended,
                        this.__prevPlayState = null,
                        this.options.live && (this.metaDataLoaded = !1)) : t.playState == A.PlayStates.IDLE && (this.__playing = !1,
                        this.__stopped = !0,
                        i.type = p.MSG.Ended);
                        break;
                    case "seekState":
                        if (this.seekState = t.seekState,
                        !this.__metaloaded)
                            return;
                        if (t.seekState == A.SeekStates.SEEKING)
                            i.type = p.MSG.Seeking;
                        else {
                            if (t.seekState != A.SeekStates.SEEKED)
                                return;
                            this.__m3u8 || this.options.live || t.playState != A.PlayStates.STOP || (this.play(),
                            this.__prevPlayState = t.playState),
                            this.__m3u8 && (i.type = p.MSG.Seeked)
                        }
                        break;
                    case "netStatus":
                        this.options.live || ("NetStream.Buffer.Full" == t.code ? (this.__prevPlayState == A.PlayStates.PAUSED || this.__prevPlayState == A.PlayStates.STOP,
                        this.__prevPlayState = null,
                        i.type = p.MSG.Seeked) : "NetStream.Seek.Complete" == t.code),
                        "NetConnection.Connect.Closed" == t.code && (this.options.src.indexOf("rtmp://") > -1 ? this.playState == A.PlayStates.STOP ? (i.type = "error",
                        t = {
                            code: 13,
                            reason: t.code
                        }) : (i.type = "error",
                        t = {
                            code: 1002,
                            reason: t.code
                        }) : this.playState = A.PlayStates.IDLE),
                        "NetStream.Play.Stop" != t.code && "NetConnection.Connect.Success" != t.code && "NetConnection.Connect.Failed" != t.code || (this.playState = A.PlayStates.IDLE);
                        break;
                    case "mediaTime":
                        this.__videoWidth = t.videoWidth,
                        this.__videoHeight = t.videoHeight,
                        i.type = p.MSG.TimeUpdate;
                        break;
                    case "error":
                        if ("NetStream.Seek.InvalidTime" == t.code)
                            return this.currentTime(t.details),
                            !1;
                        "NetStream.Play.StreamNotFound" == t.code && this.pub({
                            type: "netStatus",
                            src: this,
                            ts: i.ts,
                            detail: t
                        });
                        var n = isNaN(parseInt(t.code)) ? 1002 : t.code
                          , r = isNaN(parseInt(t.code)) ? t.code : t.msg
                          , s = r.match(/#(\d+)/);
                        s && s[1] && (n = s[1]),
                        t = {
                            code: n,
                            reason: r || ""
                        },
                        this.metaDataLoaded = !1
                    }
                    var a = "printLog" == e || "canPlay" == e;
                    !a && this.pub({
                        type: i.type,
                        src: this,
                        ts: i.ts,
                        detail: t
                    })
                } catch (t) {
                    y.console.error(e + " " + i.type, t)
                }
            }
            ,
            t.prototype.handleMsg = function(e) {}
            ,
            t.prototype.videoWidth = function() {
                return this.__videoWidth
            }
            ,
            t.prototype.videoHeight = function() {
                return this.__videoHeight
            }
            ,
            t.prototype.width = function(e) {
                return "undefined" == typeof e ? this.el && this.el.width : (e = "100%",
                this.el && (this.el.width = e))
            }
            ,
            t.prototype.height = function(e) {
                return "undefined" == typeof e ? this.el && this.el.height : (e = "100%",
                this.el && (this.el.height = e))
            }
            ,
            t.prototype.play = function(e) {
                this.playState == A.PlayStates.PAUSED || this.playState == A.PlayStates.PLAYING || e ? this.el.playerResume() : this.playState != A.PlayStates.PLAYING && this.el.playerPlay()
            }
            ,
            t.prototype.togglePlay = function() {
                if (this.metaDataLoaded)
                    if (this.playState == A.PlayStates.PAUSED)
                        this.el.playerResume();
                    else if (this.playState == A.PlayStates.PLAYING)
                        this.el.playerPause();
                    else if (this.playState == A.PlayStates.STOP)
                        this.currentTime(0),
                        this.el.playerResume();
                    else
                        try {
                            this.el.playerPlay()
                        } catch (e) {
                            console.warn("Flash 调用失败，请检查Flash是否启用成功")
                        }
                else
                    this.player.load()
            }
            ,
            t.prototype.pause = function() {
                this.el.playerPause()
            }
            ,
            t.prototype.stop = function() {
                this.el.playerStop()
            }
            ,
            t.prototype.paused = function() {
                return !this.__playing
            }
            ,
            t.prototype.buffered = function() {
                var e;
                return this.__m3u8 ? this.__buffered || 0 : (e = (this.__bytesloaded || 0) / (this.__bytesTotal || 1),
                this.duration() * e)
            }
            ,
            t.prototype.currentTime = function(e) {
                return "undefined" == typeof e ? this.el.getPosition() : void this.el.playerSeek(e)
            }
            ,
            t.prototype.duration = function() {
                return this.__duration
            }
            ,
            t.prototype.mute = function(e) {
                return "undefined" == typeof e ? 0 == this.volume() : void this.volume(e ? 0 : this.__lastVol)
            }
            ,
            t.prototype.volume = function(e) {
                return "undefined" == typeof e ? this.el && this.el.getState().volume : (this.el && this.el.playerVolume(e),
                0 != e && (this.__lastVol = e),
                this.options.volume = e,
                void this.pub({
                    type: p.MSG.VolumeChange,
                    src: this,
                    ts: +new Date
                }))
            }
            ,
            t.prototype.fullscreen = function(e) {
                return y.doFullscreen(this.player, e, this.owner)
            }
            ,
            t.prototype.load = function(e, t) {
                this.pub({
                    type: p.MSG.Load,
                    src: this,
                    ts: +new Date,
                    detail: {
                        src: e,
                        type: t
                    }
                }),
                this.el && this.el.playerLoad(e)
            }
            ,
            t.prototype.playing = function() {
                return this.el && this.el.getState && this.el.getState().playState === A.PlayStates.PLAYING
            }
            ,
            t.prototype.type = function() {
                return this.__type
            }
            ,
            t.prototype.state = function() {
                return this.playState
            }
            ,
            t
        }(u["default"]);
        t["default"] = w
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(24)
          , c = n(l)
          , u = i(28)
          , p = n(u)
          , h = i(29)
          , d = n(h)
          , f = i(30)
          , y = i(31)
          , v = n(y)
          , A = i(32)
          , m = n(A)
          , g = i(33)
          , w = n(g)
          , b = i(34)
          , S = n(b)
          , I = i(4)
          , M = i(2)
          , E = o(M)
          , _ = i(3)
          , T = o(_)
          , C = i(1)
          , D = o(C)
          , L = function(e) {
            function t(i) {
                return r(this, t),
                s(this, e.call(this, i, "Panel"))
            }
            return a(t, e),
            t.prototype.render = function(t) {
                return this.createEl("div", {
                    class: "vcp-controls-panel"
                }),
                this.el.appendChild(E.createEl("div", {
                    class: "vcp-panel-bg"
                })),
                this.playToggle = new p["default"](this.player),
                this.playToggle.render(this.el),
                this.timelabel = new m["default"](this.player),
                this.timelabel.render(this.el),
                this.timeline = new v["default"](this.player),
                this.timeline.render(this.el),
                this.options.fullscreenEnabled === !0 && (this.fullscreen = new d["default"](this.player),
                this.fullscreen.render(this.el)),
                D.IS_MOBILE || (this.volume = new w["default"](this.player),
                this.volume.render(this.el)),
                this.options.videoSource && this.options.videoSource.definitions.length > 1 && !D.IS_MOBILE && (this.claritySwitcher = new S["default"](this.player),
                this.claritySwitcher.render(this.el)),
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                var e = T.bind(this, this.handleMsg);
                this.sub(f.MSG.Changing, this.volume, e),
                this.sub(f.MSG.Changed, this.timeline.progress, e),
                this.sub(I.MSG.TimeUpdate, this.player.video, e),
                this.sub(I.MSG.Progress, this.player.video, e),
                this.sub(I.MSG.MetaLoaded, this.player.video, e),
                this.sub(I.MSG.Pause, this.player.video, e),
                this.sub(I.MSG.Play, this.player.video, e),
                this.sub(I.MSG.Ended, this.player.video, e)
            }
            ,
            t.prototype.handleMsg = function(e) {
                switch (e.type) {
                case I.MSG.MetaLoaded:
                    this.timeline.percent(this.player.percent()),
                    this.timeline.buffered(this.player.buffered()),
                    this.player.volume("undefined" == typeof this.options.volume ? .5 : this.options.volume),
                    !this.options.autoplay && this.show();
                    break;
                case I.MSG.TimeUpdate:
                    this.timeline.scrubbing || this.timeline.percent(this.player.percent());
                    break;
                case I.MSG.Pause:
                    this.show();
                    break;
                case I.MSG.Play:
                    this.hide();
                    break;
                case I.MSG.Progress:
                    this.timeline.buffered(this.player.buffered());
                    break;
                case f.MSG.Changed:
                    e.src === this.timeline.progress && this.player.percent(this.timeline.percent());
                    break;
                case I.MSG.Ended:
                    this.show()
                }
            }
            ,
            t.prototype.toggle = function() {
                E.hasClass(this.el, "show") ? this.hide() : this.show()
            }
            ,
            t.prototype.show = function() {
                E.hasClass(this.el, "hide") && (E.removeClass(this.el, "hide"),
                E.addClass(this.el, "show"))
            }
            ,
            t.prototype.hide = function() {
                E.removeClass(this.el, "show"),
                E.addClass(this.el, "hide")
            }
            ,
            t
        }(c["default"]);
        t["default"] = L
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(24)
          , c = n(l)
          , u = i(2)
          , p = (o(u),
        i(4))
          , h = (o(p),
        i(3))
          , d = (o(h),
        i(25))
          , f = (o(d),
        function(e) {
            function t(i) {
                return r(this, t),
                s(this, e.call(this, i, "PlayToggle"))
            }
            return a(t, e),
            t.prototype.render = function(t) {
                return this.createEl("div", {
                    class: "vcp-playtoggle"
                }),
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                this.on("click", this.onClick)
            }
            ,
            t.prototype.onClick = function() {
                this.player.togglePlay()
            }
            ,
            t.prototype.handleMsg = function(e) {
                console.log("@" + this.name, e)
            }
            ,
            t
        }(c["default"]));
        t["default"] = f
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(24)
          , c = n(l)
          , u = i(2)
          , p = (o(u),
        i(4))
          , h = (o(p),
        i(3))
          , d = o(h)
          , f = function(e) {
            function t(i) {
                return r(this, t),
                s(this, e.call(this, i, "FullscreenToggle"))
            }
            return a(t, e),
            t.prototype.render = function(t) {
                return this.createEl("div", {
                    class: "vcp-fullscreen-toggle"
                }),
                window.fsApi = d.FullscreenApi,
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                this.on("click", this.onClick)
            }
            ,
            t.prototype.onClick = function() {
                this.player.fullscreen(!this.player.fullscreen())
            }
            ,
            t.prototype.handleMsg = function(e) {
                console.log(t.name, e)
            }
            ,
            t
        }(c["default"]);
        t["default"] = f
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0,
        t.MSG = void 0;
        var l = i(24)
          , c = n(l)
          , u = i(2)
          , p = o(u)
          , h = i(4)
          , d = (o(h),
        i(3))
          , f = (o(d),
        t.MSG = {
            Changing: "sliderchanging",
            Changed: "sliderchanged"
        })
          , y = function(e) {
            function t(i, o) {
                r(this, t);
                var n = s(this, e.call(this, i, "Slider"));
                return n.vertical = o || !1,
                n
            }
            return a(t, e),
            t.prototype.render = function(t, i) {
                var o = this.vertical ? "vcp-slider-vertical" : "vcp-slider";
                return this.createEl("div", {
                    class: o
                }),
                this.track = p.createEl("div", {
                    class: "vcp-slider-track"
                }),
                this.thumb = p.createEl("div", {
                    class: "vcp-slider-thumb"
                }),
                this.el.appendChild(this.track),
                this.el.appendChild(this.thumb),
                this.enabled = "undefined" == typeof i || i,
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                this.enabled && (this.ownerDoc = document.body.ownerDocument,
                this.on("mousedown", this.mousedown),
                this.on("touchstart", this.mousedown))
            }
            ,
            t.prototype.handleMsg = function(e) {}
            ,
            t.prototype.mousedown = function(e) {
                return e.preventDefault && e.preventDefault(),
                this.pos = p.findElPosition(this.el),
                this.on(this.ownerDoc, "mouseup", this.mouseup),
                this.on(this.ownerDoc, "mousemove", this.mousemove),
                this.on(this.ownerDoc, "touchend", this.mouseup),
                this.on(this.ownerDoc, "touchmove", this.mousemove),
                this.mousemove(e),
                !1
            }
            ,
            t.prototype.mouseup = function(e) {
                e.target || e.srcElement;
                this.off(this.ownerDoc, "mouseup", this.mouseup),
                this.off(this.ownerDoc, "mousemove", this.mousemove),
                this.off(this.ownerDoc, "touchend", this.mouseup),
                this.off(this.ownerDoc, "touchmove", this.mousemove),
                this.pub({
                    type: f.Changed,
                    src: this,
                    private: !0
                })
            }
            ,
            t.prototype.mousemove = function(e) {
                var t = p.getPointerPosition(this.el, e, this.pos);
                this.vertical ? (this.__percent = 1 - t.y,
                this.thumb.style.top = 100 * this.__percent + "%") : (this.__percent = t.x,
                this.thumb.style.left = 100 * this.__percent + "%"),
                this.__percent = Number(this.__percent.toFixed(3)),
                this.pub({
                    type: f.Changing,
                    src: this,
                    private: !0
                })
            }
            ,
            t.prototype.percent = function(e) {
                return e || 0 == e ? (this.__percent = e,
                void (this.vertical ? this.thumb.style.top = 100 * this.__percent + "%" : this.thumb.style.left = 100 * this.__percent + "%")) : this.__percent
            }
            ,
            t
        }(c["default"]);
        t["default"] = y
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(30)
          , c = n(l)
          , u = i(24)
          , p = n(u)
          , h = i(2)
          , d = (o(h),
        i(3))
          , f = o(d)
          , y = function(e) {
            function t(i) {
                return r(this, t),
                s(this, e.call(this, i, "Timeline"))
            }
            return a(t, e),
            t.prototype.render = function(t) {
                return this.enabled = !this.options.live,
                this.createEl("div", {
                    class: "vcp-timeline"
                }),
                this.progress = new c["default"](this.player,!1),
                this.progress.render(this.el, this.enabled),
                this.track = this.progress.track,
                this.enabled || (this.el.style.display = "none"),
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                this.enabled && (this.sub(l.MSG.Changing, this.progress, f.bind(this, this.handleMsg)),
                this.sub(l.MSG.Changed, this.progress, f.bind(this, this.handleMsg)))
            }
            ,
            t.prototype.handleMsg = function(e) {
                e.type === l.MSG.Changing ? (this.scrubbing = !0,
                this.syncLabel(this.percent())) : e.type === l.MSG.Changed && (this.scrubbing = !1)
            }
            ,
            t.prototype.syncLabel = function(e) {
                var t = this.player.duration();
                e = Math.min(e, 1);
                var i = "";
                t && (i = f.convertTime(e * t) + " / " + f.convertTime(t)),
                this.pub({
                    type: "timelabel",
                    src: "timeline",
                    label: i,
                    private: !0
                })
            }
            ,
            t.prototype.buffered = function(e) {
                this.enabled && (e = Math.min(e, 1),
                this.__buffered = e,
                this.track.style.width = 100 * e + "%")
            }
            ,
            t.prototype.percent = function(e) {
                if (this.enabled)
                    return "undefined" == typeof e ? this.progress.percent() || 0 : (e = Math.min(e, 1),
                    this.syncLabel(e),
                    this.__buffered < e && this.buffered(this.player.buffered()),
                    this.progress.percent(e))
            }
            ,
            t
        }(p["default"]);
        t["default"] = y
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(30)
          , c = (n(l),
        i(24))
          , u = n(c)
          , p = i(2)
          , h = (o(p),
        i(3))
          , d = o(h)
          , f = function(e) {
            function t(i) {
                return r(this, t),
                s(this, e.call(this, i, "Timelabel"))
            }
            return a(t, e),
            t.prototype.render = function(t) {
                return this.createEl("span", {
                    class: "vcp-timelabel"
                }),
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                this.sub("timelabel", "timeline", d.bind(this, this.handleMsg))
            }
            ,
            t.prototype.handleMsg = function(e) {
                this.el.innerHTML = e.label
            }
            ,
            t
        }(u["default"]);
        t["default"] = f
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(30)
          , c = n(l)
          , u = i(24)
          , p = n(u)
          , h = i(2)
          , d = o(h)
          , f = i(3)
          , y = o(f)
          , v = i(4)
          , A = function(e) {
            function t(i) {
                return r(this, t),
                s(this, e.call(this, i, "Volume"))
            }
            return a(t, e),
            t.prototype.render = function(t) {
                return this.createEl("div", {
                    class: "vcp-volume"
                }),
                this.bg = d.createEl("div", {
                    class: "vcp-volume-bg"
                }),
                this.el.appendChild(this.bg),
                this.volume = new c["default"](this.player,!0),
                this.volume.render(this.el),
                this.track = this.volume.track,
                this.icon = d.createEl("span", {
                    class: "vcp-volume-icon"
                }),
                this.el.appendChild(this.icon),
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                this.sub(l.MSG.Changing, this.volume, y.bind(this, this.handleMsg)),
                this.sub(l.MSG.Changed, this.volume, y.bind(this, this.handleMsg)),
                this.sub(v.MSG.VolumeChange, this.player.video, y.bind(this, this.handleMsg)),
                this.on(this.icon, "click", this.toggleMute)
            }
            ,
            t.prototype.handleMsg = function(e) {
                switch (e.type) {
                case l.MSG.Changing:
                    this.syncTrack(this.percent());
                    break;
                case l.MSG.Changed:
                    this.percent(this.percent());
                    break;
                case v.MSG.VolumeChange:
                    var t = this.player.volume();
                    this.syncTrack(t),
                    0 == t ? this.syncMute(!0) : t > 0 && this.__muted && this.syncMute(!1)
                }
            }
            ,
            t.prototype.toggleMute = function(e) {
                var t = !this.player.mute();
                this.player.mute(t)
            }
            ,
            t.prototype.syncMute = function(e) {
                e ? d.addClass(this.el, "vcp-volume-muted") : d.removeClass(this.el, "vcp-volume-muted"),
                this.__muted = e
            }
            ,
            t.prototype.syncTrack = function(e) {
                this.track.style.height = 100 * e + "%",
                this.volume.percent(1 - e)
            }
            ,
            t.prototype.percent = function(e) {
                return "undefined" == typeof e ? 1 - this.volume.percent() || 0 : (this.player.volume(e),
                e)
            }
            ,
            t
        }(p["default"]);
        t["default"] = A
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(24)
          , c = n(l)
          , u = i(2)
          , p = o(u)
          , h = i(3)
          , d = o(h)
          , f = {
            od: "超清",
            hd: "高清",
            sd: "标清"
        }
          , y = function(e) {
            function t(i) {
                r(this, t);
                var o = s(this, e.call(this, i, "ClaritySwitcher"));
                return f = d.extend({}, i.options.clarityLabel, f),
                i.claritySwitcher = o,
                o
            }
            return a(t, e),
            t.prototype.render = function(t) {
                this.show = !1,
                this.createEl("div", {
                    class: "vcp-clarityswitcher"
                }),
                this.current = p.createEl("a", {
                    class: "vcp-vertical-switcher-current"
                }),
                this.container = p.createEl("div", {
                    class: "vcp-vertical-switcher-container"
                }),
                this.items = [],
                this.currentItem = "";
                var i = this.options.videoSource;
                this.current.innerHTML = f[i.curDef],
                this.el.appendChild(this.current);
                for (var o = 0; o < i.definitions.length; o++) {
                    var n = p.createEl("a", {
                        class: "vcp-vertical-switcher-item"
                    });
                    n.innerHTML = f[i.definitions[o]],
                    i.definitions[o] == i.curDef && (p.addClass(n, "current"),
                    this.currentItem = n),
                    n.setAttribute("data-def", i.definitions[o]),
                    this.items.push(n),
                    this.container.appendChild(n)
                }
                return this.el.appendChild(this.container),
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                this.on("click", this.onClick),
                this.on("mouseenter", this.onMouseEnter),
                this.on("mouseleave", this.onMouseLeave)
            }
            ,
            t.prototype.onClick = function(e) {
                var t = e.target.getAttribute("data-def");
                t ? (this.current.innerHTML = f[t],
                p.removeClass(this.currentItem, "current"),
                p.addClass(e.target, "current"),
                this.currentItem = e.target,
                this.player._switchClarity(t)) : !this.show
            }
            ,
            t.prototype.onMouseLeave = function() {
                this.container.style.display = "none",
                this.show = !1
            }
            ,
            t.prototype.onMouseEnter = function() {
                this.container.style.display = "block",
                this.show = !0
            }
            ,
            t.prototype.setClarity = function(e) {
                e && (this.current.innerHTML = f[e],
                p.removeClass(document.querySelector(".vcp-vertical-switcher-item.current"), "current"),
                p.addClass(document.querySelector('.vcp-vertical-switcher-item[data-def="' + e + '"]'), "current"),
                this.currentItem = document.querySelector('.vcp-vertical-switcher-item[data-def="' + e + '"]'),
                this.player._switchClarity(e))
            }
            ,
            t
        }(c["default"]);
        t["default"] = y
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(24)
          , c = n(l)
          , u = i(1)
          , p = o(u)
          , h = function(e) {
            function t(i) {
                return r(this, t),
                s(this, e.call(this, i, "BigPlay"))
            }
            return a(t, e),
            t.prototype.render = function(t) {
                return this.createEl("div", {
                    class: "vcp-bigplay"
                }),
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                this.on("click", this.onClick)
            }
            ,
            t.prototype.onClick = function() {
                var e = this.player.video;
                return p.IS_MOBILE && !e.paused() ? this.player.panel && this.player.panel.toggle() : void this.player.togglePlay()
            }
            ,
            t.prototype.handleMsg = function(e) {
                console.log("@" + this.name, e)
            }
            ,
            t
        }(c["default"]);
        t["default"] = h
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
          , c = i(24)
          , u = n(c)
          , p = i(2)
          , h = o(p)
          , d = i(3)
          , f = o(d)
          , y = i(1)
          , v = o(y)
          , A = i(4)
          , m = function(e) {
            function t(i) {
                r(this, t);
                var o = s(this, e.call(this, i, "Poster"));
                return o.options.poster && "object" == l(o.options.poster) ? o.poster = o.options.poster : "string" == typeof o.options.poster ? o.poster = {
                    src: o.options.poster
                } : o.poster = {},
                o
            }
            return a(t, e),
            t.prototype.render = function(t) {
                this.createEl("div", {
                    class: "vcp-poster"
                }),
                this.hide();
                var i = this.poster;
                if (i) {
                    this.pic = h.createEl("img", {
                        class: "vcp-poster-pic"
                    });
                    var o = this.poster.style;
                    switch (o) {
                    case "stretch":
                        h.addClass(this.pic, "stretch");
                        break;
                    case "cover":
                        h.addClass(this.pic, "cover");
                        break;
                    default:
                        h.addClass(this.pic, "default")
                    }
                    this.el.appendChild(this.pic)
                }
                return e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {
                this.on("click", this.onClick),
                this.sub(A.MSG.Load, this.player.video, f.bind(this, this.handleMsg)),
                this.sub(A.MSG.MetaLoaded, this.player.video, f.bind(this, this.handleMsg)),
                this.sub(A.MSG.Play, this.player.video, f.bind(this, this.handleMsg)),
                this.sub(A.MSG.Pause, this.player.video, f.bind(this, this.handleMsg)),
                this.sub(A.MSG.Ended, this.player.video, f.bind(this, this.handleMsg)),
                this.sub(A.MSG.Error, this.player.video, f.bind(this, this.handleMsg))
            }
            ,
            t.prototype.onClick = function() {
                this.pub({
                    type: "click",
                    src: this
                }),
                (v.IS_SAFARI && parseInt(v.SAFARI_VERSION) > 10 || v.IOS_VERSION > 10 || v.IS_PCWECHAT) && "system" == this.player.options.controls && this.player.togglePlay()
            }
            ,
            t.prototype.handleMsg = function(e) {
                switch (e.type) {
                case A.MSG.Load:
                    this.__loaded = !1,
                    this.setPoster(this.poster.start);
                    break;
                case A.MSG.MetaLoaded:
                    if (this.__loaded = !0,
                    !this.player.playing())
                        break;
                    this.hide();
                case A.MSG.Play:
                    if (!this.__loaded)
                        break;
                    this.hide();
                    break;
                case A.MSG.Pause:
                    if (!this.__loaded)
                        break;
                    this.options.pausePosterEnabled === !0 && this.setPoster(this.poster.pause);
                    break;
                case A.MSG.Ended:
                    if (!this.__loaded)
                        break;
                    break;
                case A.MSG.Error:
                    if (!this.__loaded)
                        break
                }
            }
            ,
            t.prototype.setPoster = function(e) {
                if (e = e || this.poster.src) {
                    this.__preload && (this.__preload.onload = null),
                    this.__preload = new Image;
                    var t = this.__preload;
                    this.hide();
                    var i = this;
                    t.onload = function() {
                        if (i.pic.src !== t.src && (i.pic.src = t.src,
                        i.show(),
                        !f.supportStyle("transform"))) {
                            var e = "stretch" == i.poster.style;
                            if (e)
                                return;
                            var o = "cover" == i.poster.style ? i.options.width / (t.width / t.height) : t.height
                              , n = "-" + i.options.width / 2 + "px"
                              , r = "-" + o / 2 + "px";
                            i.pic.style.cssText = "left: 50%; top: 50%; margin-left: " + n + "; margin-top: " + r + ";"
                        }
                    }
                    ,
                    t.src = e
                }
            }
            ,
            t.prototype.toggle = function(e) {
                clearTimeout(this.__tid);
                var t = this;
                this.__tid = setTimeout(function() {
                    t.el.style.display = e
                }, 100)
            }
            ,
            t.prototype.hide = function() {
                this.__preload && (this.__preload.onload = null),
                this.toggle("none")
            }
            ,
            t.prototype.show = function() {
                this.toggle("block")
            }
            ,
            t
        }(u["default"]);
        t["default"] = m
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(24)
          , c = n(l)
          , u = i(2)
          , p = (o(u),
        i(4))
          , h = (o(p),
        i(3))
          , d = (o(h),
        function(e) {
            function t(i) {
                r(this, t);
                var o = s(this, e.call(this, i, "Loading"));
                return o.timeSeed = null,
                o
            }
            return a(t, e),
            t.prototype.render = function(t) {
				var vcp_loading_el = this.createEl("div", {
                    class: "vcp-loading"
                });
				vcp_loading_el.style.visibility = "hidden";
                return vcp_loading_el,
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {}
            ,
            t.prototype.handleMsg = function(e) {}
            ,
            t.prototype.show = function() {
                var e = this;
                if (this.options.showLoading !== !1) {
                    var t = 500;
                    this.timeSeed = setTimeout(function() {
                        e.el.style.display = "block"
                    }, t)
                }
            }
            ,
            t.prototype.hide = function() {
                var e = this;
                this.timeSeed && (clearTimeout(this.timeSeed),
                this.timeSeed = null),
                setTimeout(function() {
                    e.el.style.display = "none"
                }, 500)
            }
            ,
            t
        }(c["default"]));
        t["default"] = d
    }
    , function(e, t, i) {
        "use strict";
        function o(e) {
            if (e && e.__esModule)
                return e;
            var t = {};
            if (null != e)
                for (var i in e)
                    Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
            return t["default"] = e,
            t
        }
        function n(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function r(e, t) {
            if (!(e instanceof t))
                throw new TypeError("Cannot call a class as a function")
        }
        function s(e, t) {
            if (!e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !t || "object" != typeof t && "function" != typeof t ? e : t
        }
        function a(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
        }
        t.__esModule = !0;
        var l = i(24)
          , c = n(l)
          , u = i(2)
          , p = (o(u),
        i(4))
          , h = (o(p),
        i(3))
          , d = o(h)
          , f = {
            EnvError: "当前系统环境不支持播放该视频格式",
            EnvFlashError: "当前系统环境不支持播放该视频格式",
            VideoSourceError: "获取视频失败，请检查播放链接是否有效",
            NetworkError: "网络错误，请检查网络配置或者播放链接是否正确",
            VideoDecodeError: "视频解码错误",
            ArgumentError: "使用参数有误，请检查播放器调用代码",
            UrlEmpty: "请填写视频播放地址",
            FileProtocol: "请勿在file协议下使用播放器，可能会导致视频无法播放",
            LiveFinish: "直播已结束,请稍后再来",
            CrossDomainError: "无法加载视频文件，跨域访问被拒绝",
            Ie9IframeFullscreenError: "在IE9中用iframe引用的实例无法支持全屏",
            WebrtcEnvError: "当前环境不支持 WebRTC 格式文件播放",
            WebrtcApiError: "调用 WebRTC 接口失败",
            WebrtcPullStreamError: "调用拉流接口失败",
            WebrtcConnectError: "连接服务器失败，并且连接重试次数已超过设定值",
            WebrtcDecodeError: "WebRTC 解码失败"
        }
          , y = {
            FileProtocol: [10],
            ArgumentError: [11],
            UrlEmpty: [12],
            LiveFinish: [13],
            VideoSourceError: [1002, 2032],
            EnvError: [4, 5],
            NetworkError: [1001, 1, 2],
            VideoDecodeError: [3],
            CrossDomainError: [2048],
            Ie9IframeFullscreenError: [10001],
            WebrtcEnvError: [2e3],
            WebrtcApiError: [2001],
            WebrtcPullStreamError: [2002],
            WebrtcConnectError: [2003],
            WebrtcDecodeError: [2004],
            WebrtcChange: [2006]
        }
          , v = [2005]
          , A = function(e) {
            function t(i) {
                r(this, t);
                var o = s(this, e.call(this, i, "ErrorTips"));
                o.customTips = d.extend({}, f, o.options.wording);
                for (var n in y)
                    for (var a = 0; a < y[n].length; a++) {
                        var l = y[n][a];
                        o.customTips[l] = o.customTips[l] || o.customTips[n]
                    }
                return o
            }
            return a(t, e),
            t.prototype.render = function(t) {
                return this.createEl("div", {
                    class: "vcp-error-tips"
                }),
                e.prototype.render.call(this, t)
            }
            ,
            t.prototype.setup = function() {}
            ,
            t.prototype.handleMsg = function(e) {}
            ,
            t.prototype.show = function(e) {
                this.el.style.display = "block";
                var t = void 0;
                if ("string" == typeof e)
                    t = e;
                else {
                    var i = this.customTips[e.code] || e.reason;
                    t = "[" + e.code + "]" + i
                }
                v.includes(e.code) || (this.el.innerHTML = d.escapeHTML(t))
            }
            ,
            t.prototype.hide = function() {
                this.el.style.display = "none"
            }
            ,
            t.prototype.clear = function() {
                this.el.innerHTML = "",
                this.hide()
            }
            ,
            t
        }(c["default"]);
        t["default"] = A
    }
    ])
});

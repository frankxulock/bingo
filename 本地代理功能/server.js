const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const PORT = 3000;

// 啟用 CORS 並允許自定義 headers
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'x-session-token', 
        'x-lang', 
        
        'signature', 
        'signature_nonce', 
        'current_time', 
        'deviceid', 
        'merchant_code', 
        'game_code', 
        'x-request-id', 

        'priority',
        'cache-control',  
        'pragma',      
        'accept',
        'accept-language',
        'referer',
        'user-agent'
    ]
}));

// 處理 JSON 及 URL encoded 請求體（POST 需要）
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 代理中介層：轉發所有以 /proxy 開頭的請求
app.use('/proxy', (req, res) => {
    const targetUrl = 'https://testpc.okbingos.com' + req.url;

    console.log(`[Proxy] ${req.method} -> ${targetUrl}`);

    // 建立代理請求參數
    const options = {
        url: targetUrl,
        method: req.method,
        headers: {
            ...req.headers,  // 轉發所有原始 headers
            host: 'testpc.okbingos.com'  // 覆寫 host
        },
        body: req.body,
        json: true,
        rejectUnauthorized: false // 忽略 SSL 問題（視需要保留）
    };

    // 使用 request 模組發送請求
    request(options)
        .on('error', (err) => {
            console.error('[Proxy Error]', err);
            res.status(500).send('Proxy Error');
        })
        .pipe(res);  // 把回應串接回 client
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`✅ Proxy server running at http://localhost:${PORT}`);
});
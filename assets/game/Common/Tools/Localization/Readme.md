# I18N 使用說明

### 資料夾路徑規範
> {Bundle Folder}/Resources/Localize/{Language}/{Custom Path}.....

路徑命名不可有任何不同，包含大小寫

所有多語系資源的自訂路徑在不同的語系資料夾下必須相同

- Bundle Folder: 各專案 Bundle 資料夾 -> G1、G2、...
- Language: 語言，依照 Token 裡面後端給的語言作為依據 -> zh-cn、en-us
- Custom Path: 資源自訂路徑，不同語系下的資源必須相同路徑

----

### 多國語系使用對象
- cc.Label: 文字
- cc.RichText: 富文字
- cc.EditBox: 輸入框
- sp.Skeleton: spine 物件
- cc.Sprite: 圖片物件

----

### 多語系工具初始化流程
在 SceneManager.changeScene 進行遊戲進入或跳轉的時候會在 Bundle 讀取後

確認 Token 給的語言是什麼並初始化語言檔

每次進行跳轉都會重新讀取 Common 的語言檔

及讀取跳轉目標專案自有的語言檔

----

### 多語系文字語言檔(.csv)
所有多語系文字依賴文字設定檔(.csv)

在 Google Sheet 上面編輯再輸出為 csv 存放在 Cocos 專案內

存放路徑為
> {Bundle Folder}/Resources/Localize/{CSV File}

- Bundle Folder: 各專案 Bundle 資料夾 -> G1、G2、...
- CSV File: 檔案放置位置

所有語言 csv 在 Google sheet 上面命名請以遊戲編號命名，如: G1、G2、...

輸出到專案內檔名會是 Language - {GameID}

若命名錯誤會造成文字檔初始化失敗

這點務必注意

----

### 多語系插件使用方式
1. 在目標物件上使用 Localize.ts 這個插件，可在 自訂工具 > 多語系 找到
2. 選取物件類型: TEXT / IMAGE / SPINE
3. 若資源放置位置正確，會自動設定好該物件使用的多語系資源路徑
4. Spine 物件若需要預設 Animation 的播放，必須在 Editor 中選好，並且所有語系的 spine animation name 必須相同(這點務必注意並請美術配合)

----

### 注意事項
- 在 MacOS 會把所有 Label 的 FontFamily 設定為 Arial，以避免字距寬度不同造成手動換行的異常
- 資源路徑在不同語系資料夾下一定要相同，否則在依照語系替換資源的時候會有問題
- 語言檔、資料夾及檔案命名務必注意大小寫及命名規則
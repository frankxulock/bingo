# 字體圖集合併工具使用說明文檔

## 1. 工具簡介

這是一個用於合併藝術字體與圖集的 Python 工具。它可以將多個字體文件（.fnt 和對應的 .png）合併到一個現有的圖集中，實現資源的整合和優化。

## 2. 系統需求

- Python 3.x
- PIL (Python Imaging Library)
- 作業系統：支援 Windows、macOS、Linux

## 3. 目錄結構
```
.
├── merge_fonts_atlas.py    # 主要腳本文件
├── image.plist            # 原始圖集配置文件
├── image.png             # 原始圖集圖片
├── [字體名].fnt          # 字體描述文件
├── [字體名].png          # 字體圖片文件
└── merged_output/        # 輸出目錄
```

## 4. 功能特點

- 支援多種字體文件的合併
- 自動計算並優化圖集佈局
- 保持原始圖集內容不變
- 自動更新配置文件
- 生成獨立的字體引用文件

## 5. 使用方法

### 5.1 環境設置

1. 確保已安裝 Python 3.x
   - macOS 使用者請使用 `python3` 命令
   - Windows 使用者可使用 `python` 命令

2. 建議使用虛擬環境（Virtual Environment）：
```bash
# 創建虛擬環境
python3 -m venv venv

# 啟動虛擬環境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安裝依賴套件
pip install pillow
```

### 5.2 基本使用

1. 確保所有需要合併的字體文件（.fnt 和 .png）都在工作目錄中
2. 運行腳本：
```bash
# macOS/Linux:
python3 merge_fonts_atlas.py

# Windows:
python merge_fonts_atlas.py
```

3. 完成後可以退出虛擬環境：
```bash
deactivate
```

### 5.3 輸入文件要求

- 圖集文件：
  - .plist 格式的配置文件
  - .png 格式的圖片文件
- 字體文件：
  - .fnt 格式的字體描述文件
  - .png 格式的字體圖片文件

### 5.4 輸出結果

在 `merged_output` 目錄中會生成：
- 合併後的圖集圖片
- 更新後的 .plist 配置文件
- 更新後的字體文件

## 6. 注意事項

1. 合併前請備份原始文件
2. 確保有足夠的磁碟空間
3. 字體文件名不要包含特殊字符
4. 確保輸入的圖片文件格式正確（支援 RGBA）

## 7. 錯誤處理

常見錯誤及解決方案：
- 文件找不到：檢查文件路徑是否正確
- 圖片格式錯誤：確保使用支援的圖片格式
- 記憶體不足：減少同時處理的字體數量

## 8. 維護建議

1. 定期檢查並更新依賴套件
2. 保持工作目錄整潔
3. 在進行大規模合併前先進行小規模測試
4. 記錄每次合併的配置和結果

## 9. 技術支援

如遇到問題，請檢查：
1. Python 版本是否符合要求
2. 依賴套件是否正確安裝
3. 文件權限是否正確
4. 輸入文件格式是否符合要求

## 10. 版本歷史

當前版本：1.0
- 支援基本的字體和圖集合併功能
- 自動佈局優化
- 配置文件自動更新 
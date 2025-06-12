import pandas as pd
import json
import os

def convert_xlsx_to_i18n():
    # 讀取Excel文件
    df = pd.read_excel('OKBINGO_ Translation.xlsx')
    
    # 獲取所有語言列（從EN開始）
    languages = ['EN', 'FIL', 'VI']
    
    # 為每種語言創建一個字典
    language_dicts = {lang: {} for lang in languages}
    
    # 遍歷每一行，構建語言字典
    for index, row in df.iterrows():
        page = row['Page']
        key = row['Key']
        
        # 如果page或key為空，跳過
        if pd.isna(page) or pd.isna(key) or str(page).strip() == '' or str(key).strip() == '':
            continue
            
        # 構建完整的key（頁面.關鍵字）
        full_key = f"{str(page).strip()}.{str(key).strip()}"
            
        # 為每種語言添加翻譯
        for lang in languages:
            value = row[lang]
            # 確保值不是NaN
            if pd.isna(value):
                value = key  # 如果翻譯為空，使用key作為默認值
            language_dicts[lang][full_key] = str(value)
    
    # 創建i18n目錄
    os.makedirs('i18n', exist_ok=True)
    
    # 保存每種語言的JSON文件
    for lang, translations in language_dicts.items():
        filename = f'i18n/{lang}.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"已成功轉換以下語言的翻譯：{', '.join(languages)}")

if __name__ == '__main__':
    convert_xlsx_to_i18n() 
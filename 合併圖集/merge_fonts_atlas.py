#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
合併藝術字體與圖集工具
Merge Artistic Fonts with Image Atlas Tool
"""

import os
import json
import xml.etree.ElementTree as ET
from PIL import Image
import re

class FontAtlasMerger:
    def __init__(self):
        self.fonts = []
        self.atlas_plist = None
        self.atlas_image = None
        self.output_dir = "merged_output"
        
    def load_atlas(self, plist_path, image_path):
        """載入現有的圖集"""
        print(f"正在載入圖集: {plist_path}")
        
        # 解析 plist 文件
        tree = ET.parse(plist_path)
        root = tree.getroot()
        self.atlas_plist = tree
        
        # 載入圖集圖像
        self.atlas_image = Image.open(image_path)
        print(f"圖集尺寸: {self.atlas_image.size}")
        
    def load_font(self, fnt_path, png_path):
        """載入字體文件"""
        font_name = os.path.basename(fnt_path).replace('.fnt', '')
        print(f"正在載入字體: {font_name}")
        
        # 讀取 fnt 文件
        font_info = self.parse_fnt_file(fnt_path)
        
        # 載入字體圖像
        font_image = Image.open(png_path)
        
        font_data = {
            'name': font_name,
            'info': font_info,
            'image': font_image,
            'png_path': png_path
        }
        
        self.fonts.append(font_data)
        print(f"字體 {font_name} 載入完成，尺寸: {font_image.size}")
        
    def parse_fnt_file(self, fnt_path):
        """解析 .fnt 文件"""
        font_info = {
            'info': {},
            'common': {},
            'chars': {},
            'kernings': []
        }
        
        with open(fnt_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('info '):
                    font_info['info'] = self.parse_fnt_line(line)
                elif line.startswith('common '):
                    font_info['common'] = self.parse_fnt_line(line)
                elif line.startswith('char id='):
                    char_data = self.parse_fnt_line(line)
                    char_id = int(char_data['id'])
                    font_info['chars'][char_id] = char_data
                elif line.startswith('kerning '):
                    kerning_data = self.parse_fnt_line(line)
                    font_info['kernings'].append(kerning_data)
                    
        return font_info
    
    def parse_fnt_line(self, line):
        """解析 fnt 文件中的一行"""
        data = {}
        # 使用正則表達式匹配 key=value 模式
        pattern = r'(\w+)=([^\s]+)'
        matches = re.findall(pattern, line)
        
        for key, value in matches:
            # 嘗試轉換為數字
            if value.isdigit() or (value.startswith('-') and value[1:].isdigit()):
                data[key] = int(value)
            elif value.replace('.', '').isdigit():
                data[key] = float(value)
            else:
                # 移除引號
                data[key] = value.strip('"')
                
        return data
    
    def merge_images(self):
        """合併所有圖像"""
        print("開始合併圖像...")
        
        # 計算新圖集的尺寸
        atlas_width, atlas_height = self.atlas_image.size
        
        # 計算所有字體圖像的總面積
        font_total_width = sum(font['image'].size[0] for font in self.fonts)
        font_max_height = max(font['image'].size[1] for font in self.fonts)
        
        # 模擬字體放置來計算實際需要的尺寸
        temp_x = 0
        temp_y = atlas_height + 10
        max_width_needed = atlas_width
        max_height_needed = temp_y
        
        for font in self.fonts:
            font_width, font_height = font['image'].size
            
            # 檢查是否需要換行
            if temp_x + font_width > atlas_width and temp_x > 0:
                temp_x = 0
                temp_y += font_max_height + 10
            
            # 更新最大寬度和高度需求
            max_width_needed = max(max_width_needed, temp_x + font_width)
            max_height_needed = max(max_height_needed, temp_y + font_height)
            
            temp_x += font_width + 10
        
        # 設置新圖集尺寸
        new_width = max_width_needed
        new_height = max_height_needed
        
        print(f"新圖集尺寸: {new_width} x {new_height}")
        
        # 創建新的圖像
        new_image = Image.new('RGBA', (new_width, new_height), (0, 0, 0, 0))
        
        # 複製原圖集
        new_image.paste(self.atlas_image, (0, 0))
        
        # 添加字體圖像
        current_x = 0
        current_y = atlas_height + 10
        
        font_positions = {}
        
        for font in self.fonts:
            font_image = font['image']
            font_width, font_height = font_image.size
            
            # 確保不超出邊界 - 檢查是否需要換行
            if current_x + font_width > atlas_width and current_x > 0:
                current_x = 0
                current_y += font_max_height + 10
            
            # 粘貼字體圖像
            new_image.paste(font_image, (current_x, current_y))
            
            # 記錄位置信息
            font_positions[font['name']] = {
                'x': current_x,
                'y': current_y,
                'width': font_width,
                'height': font_height
            }
            
            print(f"字體 {font['name']} 放置在位置: ({current_x}, {current_y})")
            
            current_x += font_width + 10
        
        self.merged_image = new_image
        self.font_positions = font_positions
        
        return new_image, font_positions
    
    def update_plist(self):
        """更新 plist 文件以包含字體信息"""
        print("正在更新 plist 配置...")
        
        root = self.atlas_plist.getroot()
        
        # 找到 frames 字典
        frames_dict = None
        # 在根字典中查找 frames 鍵
        root_dict = root.find('dict')
        if root_dict is not None:
            children = list(root_dict)
            for i, child in enumerate(children):
                if child.tag == 'key' and child.text == 'frames':
                    # 下一個元素應該是 frames 的字典
                    if i + 1 < len(children):
                        frames_dict = children[i + 1]
                    break
        
        if frames_dict is None:
            print("錯誤: 無法找到 frames 字典")
            return
        
        # 注意：我們不再將字體添加到 frames 中
        # 字體將作為獨立的紋理通過 .fnt 文件引用
        print("跳過將字體添加到 plist frames - 字體將作為獨立紋理使用")
        
        # 更新 metadata 中的尺寸信息
        self.update_metadata(root_dict)
        
        print(f"已準備 {len(self.fonts)} 個字體用於獨立紋理引用")
    
    def update_metadata(self, root_dict):
        """更新 metadata 中的尺寸信息"""
        children = list(root_dict)
        for i, child in enumerate(children):
            if child.tag == 'key' and child.text == 'metadata':
                # 找到 metadata 字典
                if i + 1 < len(children):
                    metadata_dict = children[i + 1]
                    
                    # 更新尺寸信息並處理其他metadata
                    metadata_children = list(metadata_dict)
                    to_remove = []  # 收集要移除的元素
                    
                    for j, meta_child in enumerate(metadata_children):
                        if meta_child.tag == 'key':
                            if meta_child.text == 'size':
                                # 更新尺寸
                                if j + 1 < len(metadata_children):
                                    size_element = metadata_children[j + 1]
                                    if size_element.tag == 'string':
                                        new_width, new_height = self.merged_image.size
                                        size_element.text = f"{{{new_width},{new_height}}}"
                                        print(f"已更新 metadata 尺寸為: {{{new_width},{new_height}}}")
                            elif meta_child.text == 'smartupdate':
                                # 標記要移除的 smartupdate 鍵值對
                                to_remove.append(meta_child)
                                if j + 1 < len(metadata_children):
                                    to_remove.append(metadata_children[j + 1])
                                print("已標記移除過時的 smartupdate 元數據")
                    
                    # 移除標記的元素
                    for element in to_remove:
                        if element in metadata_dict:
                            metadata_dict.remove(element)
                break
    
    def create_updated_font_files(self):
        """創建更新後的字體文件，指向新的合併圖集"""
        print("正在創建更新後的字體文件...")
        
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        
        for font in self.fonts:
            font_name = font['name']
            position = self.font_positions[font_name]
            
            # 創建新的 fnt 文件內容
            fnt_content = []
            
            # info 行 - 更新圖像文件名
            info = font['info']['info'].copy()
            info_line = f'info face="{info.get("face", font_name)}" size={info.get("size", 72)} bold={info.get("bold", 0)} italic={info.get("italic", 0)} charset="{info.get("charset", "")}" unicode={info.get("unicode", 1)} stretchH={info.get("stretchH", 100)} smooth={info.get("smooth", 1)} aa={info.get("aa", 1)} padding={info.get("padding", "2,2,2,2")} spacing={info.get("spacing", "2,2")}'
            fnt_content.append(info_line)
            
            # common 行 - 更新圖集尺寸
            common = font['info']['common'].copy()
            common['scaleW'] = self.merged_image.size[0]
            common['scaleH'] = self.merged_image.size[1]
            common_line = f'common lineHeight={common.get("lineHeight", 72)} base={common.get("base", 60)} scaleW={common["scaleW"]} scaleH={common["scaleH"]} pages={common.get("pages", 1)} packed={common.get("packed", 0)}'
            fnt_content.append(common_line)
            
            # page 行 - 更新圖像文件名
            fnt_content.append(f'page id=0 file="image.png"')
            
            # chars 信息
            fnt_content.append(f'chars count={len(font["info"]["chars"])}')
            
            # 每個字符 - 調整 x, y 座標
            for char_id, char_data in font['info']['chars'].items():
                new_char_data = char_data.copy()
                new_char_data['x'] += position['x']
                new_char_data['y'] += position['y']
                
                char_line = f'char id={char_id} x={new_char_data["x"]} y={new_char_data["y"]} width={new_char_data["width"]} height={new_char_data["height"]} xoffset={new_char_data["xoffset"]} yoffset={new_char_data["yoffset"]} xadvance={new_char_data["xadvance"]} page={new_char_data["page"]} chnl={new_char_data["chnl"]}'
                fnt_content.append(char_line)
            
            # kerning 信息
            if font['info']['kernings']:
                fnt_content.append(f'kernings count={len(font["info"]["kernings"])}')
                for kerning in font['info']['kernings']:
                    kerning_line = f'kerning first={kerning["first"]} second={kerning["second"]} amount={kerning["amount"]}'
                    fnt_content.append(kerning_line)
            
            # 保存新的 fnt 文件
            output_fnt_path = os.path.join(self.output_dir, f"{font_name}.fnt")
            with open(output_fnt_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(fnt_content))
            
            print(f"已創建更新後的字體文件: {output_fnt_path}")
    
    def save_merged_files(self):
        """保存合併後的文件"""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        
        # 保存合併後的圖像
        merged_image_path = os.path.join(self.output_dir, "image.png")
        self.merged_image.save(merged_image_path)
        print(f"已保存合併後的圖集: {merged_image_path}")
        
        # 保存更新後的 plist（使用自定義格式化）
        merged_plist_path = os.path.join(self.output_dir, "image.plist")
        self.save_formatted_plist(merged_plist_path)
        print(f"已保存更新後的 plist: {merged_plist_path}")
    
    def save_formatted_plist(self, output_path):
        """保存格式化的 plist 文件"""
        from xml.dom import minidom
        
        # 使用 minidom 來格式化 XML
        rough_string = ET.tostring(self.atlas_plist.getroot(), 'utf-8')
        reparsed = minidom.parseString(rough_string)
        
        # 獲取格式化的 XML 字符串
        formatted_xml = reparsed.toprettyxml(indent="    ")
        
        # 移除空白行
        lines = formatted_xml.split('\n')
        non_empty_lines = [line for line in lines if line.strip() != '']
        
        # 修正第一行 XML 聲明和添加 DOCTYPE
        if non_empty_lines[0].startswith('<?xml'):
            non_empty_lines[0] = '<?xml version="1.0" encoding="UTF-8"?>'
            # 插入 DOCTYPE 聲明
            doctype_line = '<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
            non_empty_lines.insert(1, doctype_line)
        
        # 保存到文件
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(non_empty_lines))
    
    def merge_all(self, atlas_plist_path, atlas_image_path, font_files):
        """執行完整的合併流程"""
        print("=== 開始合併藝術字體與圖集 ===")
        
        # 載入圖集
        self.load_atlas(atlas_plist_path, atlas_image_path)
        
        # 載入所有字體
        for fnt_path, png_path in font_files:
            self.load_font(fnt_path, png_path)
        
        # 合併圖像
        self.merge_images()
        
        # 更新 plist
        self.update_plist()
        
        # 創建更新後的字體文件
        self.create_updated_font_files()
        
        # 保存所有文件
        self.save_merged_files()
        
        print("=== 合併完成! ===")
        print(f"輸出目錄: {self.output_dir}")
        print("文件清單:")
        print("- image.png (合併後的圖集)")
        print("- image.plist (更新後的配置文件)")
        for font in self.fonts:
            print(f"- {font['name']}.fnt (更新後的字體文件)")


def main():
    merger = FontAtlasMerger()
    
    # 定義文件路徑
    atlas_plist = "image.plist"
    atlas_image = "image.png"
    
    font_files = [
        ("DIN_BoldText.fnt", "DIN_BoldText.png"),
        ("SFProText.fnt", "SFProText.png"),
        ("DINText.fnt", "DINText.png"),
        ("InterText.fnt", "InterText.png")
    ]
    
    # 執行合併
    merger.merge_all(atlas_plist, atlas_image, font_files)


if __name__ == "__main__":
    main() 
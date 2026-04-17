#!/usr/bin/env python3
"""
播客音频生成脚本
- 阿正（男声）：zh-CN-YunxiNeural
- 小蓝（女声）：zh-CN-XiaoxiaoNeural
- 片头/片尾：zh-CN-YunyangNeural
"""

import re
import subprocess
import os
from pathlib import Path

# 角色声音映射
VOICES = {
    "阿正": "zh-CN-YunxiNeural",
    "小蓝": "zh-CN-XiaoxiaoNeural",
    "片头片尾": "zh-CN-YunyangNeural"
}

# 工作目录
WORK_DIR = Path(__file__).parent / "播客音频"
WORK_DIR.mkdir(parents=True, exist_ok=True)

def parse_script(script_path):
    """解析播客脚本，提取对话"""
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    segments = []
    
    # 分割对话行（以 **角色**： 开头）
    pattern = r'\*\*([阿正小蓝片头片尾]+)\*\*[：:](.+?)(?=\n\*\*|$)'
    
    matches = re.findall(pattern, content, re.DOTALL)
    
    for speaker, text in matches:
        text = text.strip()
        # 清理文本中的Markdown格式
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        text = re.sub(r'\*\*([^\*]+)\*\*', r'\1', text)
        text = re.sub(r'\*([^\*]+)\*', r'\1', text)
        text = re.sub(r'\n+', ' ', text)
        text = re.sub(r'\s*---\s*', '', text)  # 移除分隔符
        
        if text and len(text) > 2:
            if "片头" in speaker or "片尾" in speaker:
                voice = VOICES["片头片尾"]
                speaker_key = "片头片尾"
            else:
                voice = VOICES.get(speaker, VOICES["阿正"])
                speaker_key = speaker
            
            segments.append({
                "speaker": speaker_key,
                "text": text,
                "voice": voice
            })
    
    return segments

def generate_audio(text, voice, output_path):
    """使用edge-tts生成音频"""
    cmd = [
        "edge-tts",
        "--voice", voice,
        "--text", text,
        "--write-media", str(output_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"生成失败: {result.stderr[:100]}")
        return False
    return True

def merge_audio(parts, output_path):
    """合并多个音频文件"""
    list_file = WORK_DIR / "filelist.txt"
    with open(list_file, 'w') as f:
        for part in parts:
            f.write(f"file '{part.absolute()}'\n")
    
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(list_file),
        "-c", "copy",
        str(output_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if list_file.exists():
        list_file.unlink()
    
    if result.returncode != 0:
        print(f"合并失败: {result.stderr[:200]}")
        return False
    return True

def main():
    script_path = Path(__file__).parent / "播客完整文案.md"
    
    print("=" * 50)
    print("🎙️ 播客音频生成器")
    print("=" * 50)
    
    print("\n📖 解析播客脚本...")
    segments = parse_script(script_path)
    print(f"   找到 {len(segments)} 个对话段")
    
    speaker_count = {}
    for seg in segments:
        speaker_count[seg["speaker"]] = speaker_count.get(seg["speaker"], 0) + 1
    print(f"   角色分布: {speaker_count}")
    
    print("\n🎵 开始生成音频...")
    audio_parts = []
    
    for i, seg in enumerate(segments):
        output_file = WORK_DIR / f"part_{i:03d}.mp3"
        
        short_text = seg["text"][:25].replace('\n', ' ')
        print(f"   [{i+1}/{len(segments)}] {seg['speaker']}: {short_text}...")
        
        success = generate_audio(seg["text"], seg["voice"], output_file)
        
        if success and output_file.exists():
            audio_parts.append(output_file)
            print(f"      ✅ 已生成")
        else:
            print(f"      ❌ 失败")
    
    if audio_parts:
        final_output = WORK_DIR / "本地生活超级AI播客.mp3"
        print(f"\n🔗 合并 {len(audio_parts)} 个音频文件...")
        
        if merge_audio(audio_parts, final_output):
            print(f"\n✅ 完成！")
            print(f"   输出文件: {final_output}")
            
            size = final_output.stat().st_size / (1024 * 1024)
            print(f"   文件大小: {size:.2f} MB")
        else:
            print("❌ 合并失败")
    else:
        print("❌ 没有生成任何音频文件")

if __name__ == "__main__":
    main()

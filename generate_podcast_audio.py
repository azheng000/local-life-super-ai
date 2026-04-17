#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地生活超级AI - 播客音频生成脚本
"""

import subprocess
import os
import re

# 声音配置
VOICES = {
    "阿正": "zh-CN-YunxiNeural",      # 阳光活泼男声
    "小蓝": "zh-CN-XiaoxiaoNeural",   # 温暖女声
    "老李": "zh-CN-YunjianNeural",    # 激情男声（商家角色）
    "旁白": "zh-CN-YunyangNeural",    # 专业男声
}

# 播客内容（精简版）
PODCAST_CONTENT = [
    # 开场
    ("旁白", "欢迎收听《AI创业实录》，本期主题：用智能体重构本地生活服务。"),
    ("阿正", "大家好，我是阿正。今天要和大家分享一个项目——本地生活超级AI。核心理念是：让每个商家都拥有自己的AI智能体。"),
    ("小蓝", "大家好，我是小蓝。今天我会从四个角度来提问：投资人、技术、用户、商家视角。阿正，准备好了吗？"),
    ("阿正", "来吧，接受挑战。"),
    
    # 投资人视角
    ("小蓝", "好，我先从投资人角度提问。你和美团、抖音的差异化在哪里？"),
    ("阿正", "差异化在于三个词：智能体、人情味、订阅制。美团是平台AI，我们给每个商家专属智能体，是商家的AI。"),
    ("小蓝", "人情味是什么意思？"),
    ("阿正", "传统平台只有评分、销量这些冷冰冰的数字。我们采集老板的故事、服务温度、真实评价。这让算力效率提升6倍。"),
    ("小蓝", "订阅制和美团的抽佣模式有什么区别？"),
    ("阿正", "美团抽佣20%以上，利益冲突。我们订阅制，商家每月299到999元，不抽佣，数据归商家。"),
    ("小蓝", "如果巨头复制你们怎么办？"),
    ("阿正", "护城河有三层：人情味数据难以复制、商家网络效应、抖音优先策略成为生态插件。"),
    ("小蓝", "你们怎么赚钱？"),
    ("阿正", "短期订阅费，中期算力银行，长期智能体交易所。"),
    
    # 技术视角
    ("小蓝", "好，现在从技术角度提问。智能体怎么实现？"),
    ("阿正", "用MCP协议，Model Context Protocol。每个商家智能体是个工具箱，有获取信息、查菜单、预约等工具。"),
    ("小蓝", "用什么大模型？"),
    ("阿正", "DeepSeek-V3。成本是GPT的十五分之一，中文能力强，国产服务。简单任务用V3，复杂推理用R1。"),
    ("小蓝", "数据库怎么设计？"),
    ("阿正", "PostgreSQL加PostGIS，9张核心表。关键是品牌信息表，专门存人情味数据。"),
    ("小蓝", "怎么保证高可用？"),
    ("阿正", "三层保障：多模型降级、缓存策略、人工接管。AI是增强，不是替代。"),
    
    # 用户视角
    ("小蓝", "现在扮演普通用户。体验是什么样的？"),
    ("阿正", "像豆包一样的对话框。输入需求，3秒收到推荐，包含商家故事。点击就能预约。"),
    ("小蓝", "推荐是真实的还是广告？"),
    ("阿正", "我们不卖广告位。匹配只看匹配度、信任分、人情味。钱买不到排名。"),
    ("小蓝", "我的数据安全吗？"),
    ("阿正", "数据资产归用户。加密存储，不会卖给第三方。"),
    
    # 商家视角
    ("小蓝", "现在扮演商家老李。你怎么说服我用？"),
    ("阿正", "老李，你现在怎么处理预约？错过多少生意？"),
    ("小蓝", "一天错过七八单吧。"),
    ("阿正", "一天损失一两千，一个月三四万。智能体7乘24小时在线，3秒回复，不会再错过。"),
    ("小蓝", "已经有美团了，接入麻烦吗？"),
    ("阿正", "一键入驻，10分钟。和美团不冲突，它获客，我们接住顾客。"),
    ("小蓝", "收多少钱？"),
    ("阿正", "基础版299元月，不抽佣。一天多接3单，回报45倍。"),
    ("小蓝", "智能体能记住老顾客吗？"),
    ("阿正", "当然。老客张三来，智能体会说：张哥来了，还是老规矩？这才是真正的人情味。"),
    ("小蓝", "好，被你说服了！"),
    
    # 结尾
    ("小蓝", "最后问，智能体经济什么时候实现？"),
    ("阿正", "三个阶段：1到2年智能体平台，2到3年算力网络，3到5年智能体经济。智能体可以交易、传承。"),
    ("小蓝", "最后给听众留一句话？"),
    ("阿正", "AI不应该只属于巨头，每个商家都应该拥有自己的AI智能体。这是算力时代的基础人权。"),
    ("小蓝", "感谢阿正分享，我们下期见！"),
    ("阿正", "再见！"),
]

def generate_audio(text, voice, output_file):
    """生成单个音频文件"""
    cmd = [
        "edge-tts",
        "--voice", voice,
        "--text", text,
        "--write-media", output_file
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except Exception as e:
        print(f"生成失败: {output_file}, 错误: {e}")
        return False

def main():
    output_dir = "播客音频"
    os.makedirs(output_dir, exist_ok=True)
    
    # 生成所有片段
    files = []
    for i, (speaker, text) in enumerate(PODCAST_CONTENT):
        voice = VOICES.get(speaker, VOICES["阿正"])
        filename = f"{output_dir}/{i:03d}_{speaker}.mp3"
        print(f"生成 [{i+1}/{len(PODCAST_CONTENT)}]: {speaker}")
        
        if generate_audio(text, voice, filename):
            files.append(filename)
    
    # 合并音频
    print("\n合并音频...")
    concat_list = "|".join(files)
    output_file = f"{output_dir}/本地生活超级AI播客_完整版.mp3"
    
    # 使用ffmpeg合并
    concat_file = f"{output_dir}/concat.txt"
    with open(concat_file, "w") as f:
        for file in files:
            f.write(f"file '{os.path.basename(file)}'\n")
    
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", concat_file,
        "-acodec", "libmp3lame", "-b:a", "128k",
        output_file
    ], cwd=output_dir, capture_output=True)
    
    print(f"\n✅ 播客音频生成完成！")
    print(f"📁 文件位置: {output_file}")
    
    # 获取文件大小
    size = os.path.getsize(output_file) / 1024 / 1024
    print(f"📊 文件大小: {size:.2f} MB")

if __name__ == "__main__":
    main()

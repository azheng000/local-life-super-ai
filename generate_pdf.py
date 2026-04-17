#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
播客文案 PDF 生成脚本
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

# 查找中文字体
font_paths = [
    '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
]

font_path = None
for p in font_paths:
    if os.path.exists(p):
        font_path = p
        break

if font_path:
    pdfmetrics.registerFont(TTFont('ChineseFont', font_path))
    print(f"使用字体: {font_path}")
else:
    print("警告: 未找到中文字体，PDF可能无法正确显示中文")

# 创建PDF
doc = SimpleDocTemplate(
    "播客完整文案.pdf",
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm
)

# 样式
title_style = ParagraphStyle(
    'ChineseTitle',
    fontName='ChineseFont',
    fontSize=24,
    leading=30,
    alignment=TA_CENTER,
    spaceAfter=30
)

heading_style = ParagraphStyle(
    'ChineseHeading',
    fontName='ChineseFont',
    fontSize=16,
    leading=20,
    spaceBefore=20,
    spaceAfter=10,
    textColor=colors.darkblue
)

body_style = ParagraphStyle(
    'ChineseBody',
    fontName='ChineseFont',
    fontSize=11,
    leading=18,
    spaceAfter=8
)

# 播客内容
content = []

# 标题
content.append(Paragraph("本地生活超级AI - 播客文案", title_style))
content.append(Paragraph("《AI创业实录》", ParagraphStyle('Sub', fontName='ChineseFont', fontSize=14, alignment=TA_CENTER)))
content.append(Spacer(1, 20))

# 基本信息
content.append(Paragraph("节目信息", heading_style))
content.append(Paragraph("主题：用智能体重构本地生活服务", body_style))
content.append(Paragraph("时长：约20分钟", body_style))
content.append(Paragraph("角色：阿正（主讲）+ 小蓝（提问者）", body_style))
content.append(Paragraph("平台：小宇宙、喜马拉雅、网易云音乐", body_style))
content.append(Spacer(1, 20))

# 开场
content.append(Paragraph("【开场】", heading_style))
content.append(Paragraph("阿正：大家好，欢迎收听《AI创业实录》，我是阿正。今天要和大家分享一个项目——本地生活超级AI。核心理念是：让每个商家都拥有自己的AI智能体。", body_style))
content.append(Paragraph("小蓝：大家好，我是小蓝。今天我会从四个角度来提问：投资人、技术、用户、商家视角。阿正，准备好了吗？", body_style))
content.append(Paragraph("阿正：来吧，接受挑战。", body_style))
content.append(Spacer(1, 15))

# 第一部分
content.append(Paragraph("【第一部分：投资人视角】", heading_style))
content.append(Paragraph("小蓝：你和美团、抖音的差异化在哪里？", body_style))
content.append(Paragraph("阿正：三个词：智能体、人情味、订阅制。美团是平台AI，我们给每个商家专属智能体，是商家的AI。", body_style))
content.append(Paragraph("小蓝：人情味是什么意思？", body_style))
content.append(Paragraph("阿正：传统平台只有评分、销量这些冷冰冰的数字。我们采集老板的故事、服务温度、真实评价。这让算力效率提升6倍。", body_style))
content.append(Paragraph("小蓝：订阅制和抽佣模式有什么区别？", body_style))
content.append(Paragraph("阿正：美团抽佣20%以上，利益冲突。我们订阅制，商家每月299到999元，不抽佣，数据归商家。护城河有三层：人情味数据难以复制、商家网络效应、抖音优先策略。", body_style))
content.append(Paragraph("小蓝：你们怎么赚钱？", body_style))
content.append(Paragraph("阿正：短期订阅费，中期算力银行，长期智能体交易所。", body_style))
content.append(Spacer(1, 15))

# 第二部分
content.append(Paragraph("【第二部分：技术实现视角】", heading_style))
content.append(Paragraph("小蓝：智能体怎么实现？", body_style))
content.append(Paragraph("阿正：用MCP协议——Model Context Protocol。每个商家智能体是个工具箱，有获取信息、查菜单、预约等工具。", body_style))
content.append(Paragraph("小蓝：用什么大模型？", body_style))
content.append(Paragraph("阿正：DeepSeek-V3。成本是GPT的十五分之一，中文能力强。简单任务用V3，复杂推理用R1，降级备选用通义千问。", body_style))
content.append(Paragraph("小蓝：数据库怎么设计？", body_style))
content.append(Paragraph("阿正：PostgreSQL加PostGIS，9张核心表。关键是品牌信息表，专门存人情味数据。三层高可用保障：多模型降级、缓存策略、人工接管。", body_style))
content.append(Spacer(1, 15))

# 第三部分
content.append(Paragraph("【第三部分：用户视角】", heading_style))
content.append(Paragraph("小蓝：用户体验是什么样的？", body_style))
content.append(Paragraph("阿正：像豆包一样的对话框。输入需求，3秒收到推荐，包含商家故事。点击就能预约。", body_style))
content.append(Paragraph("小蓝：推荐是真实的还是广告？", body_style))
content.append(Paragraph("阿正：我们不卖广告位。匹配只看匹配度、信任分、人情味。钱买不到排名。数据资产归用户。", body_style))
content.append(Spacer(1, 15))

# 第四部分
content.append(Paragraph("【第四部分：商家视角】", heading_style))
content.append(Paragraph("小蓝（扮演老李）：一天错过七八单吧。", body_style))
content.append(Paragraph("阿正：一天损失一两千，一个月三四万。智能体7×24小时在线，3秒回复，不会再错过。", body_style))
content.append(Paragraph("小蓝（扮演老李）：已经有美团了，接入麻烦吗？", body_style))
content.append(Paragraph("阿正：一键入驻，10分钟。和美团不冲突，它获客，我们接住顾客。基础版299元月，不抽佣。", body_style))
content.append(Paragraph("小蓝（扮演老李）：智能体能记住老顾客吗？", body_style))
content.append(Paragraph("阿正：当然。老客张三来，智能体会说：张哥来了，还是老规矩？这才是真正的人情味。", body_style))
content.append(Paragraph("小蓝（扮演老李）：好，被你说服了！", body_style))
content.append(Spacer(1, 15))

# 结尾
content.append(Paragraph("【结尾：未来展望】", heading_style))
content.append(Paragraph("小蓝：智能体经济什么时候实现？", body_style))
content.append(Paragraph("阿正：三个阶段：1到2年智能体平台，2到3年算力网络，3到5年智能体经济。智能体可以交易、传承。", body_style))
content.append(Spacer(1, 20))

# 金句
content.append(Paragraph("【核心金句】", heading_style))
content.append(Paragraph("AI不应该只属于巨头，每个商家都应该拥有自己的AI智能体。这是算力时代的基础人权。", 
    ParagraphStyle('Quote', fontName='ChineseFont', fontSize=14, leading=22, textColor=colors.darkblue, alignment=TA_CENTER)))
content.append(Spacer(1, 30))

# 数据卡片
content.append(Paragraph("【关键数据】", heading_style))
content.append(Paragraph("市场规模：中国本地生活市场2.8万亿/年", body_style))
content.append(Paragraph("商家数量：约2000万", body_style))
content.append(Paragraph("成本优势：DeepSeek比GPT便宜15倍", body_style))
content.append(Paragraph("效率提升：人情味数据提升转化6倍", body_style))
content.append(Paragraph("商业模式：订阅制vs抽佣制，商家省20%+", body_style))
content.append(Paragraph("目标：第一年1000家活跃商家", body_style))
content.append(Spacer(1, 30))

# 页脚
content.append(Paragraph("GitHub: https://github.com/azheng000/local-life-super-ai", 
    ParagraphStyle('Footer', fontName='ChineseFont', fontSize=10, textColor=colors.grey)))
content.append(Paragraph("创建日期: 2026-04-17", 
    ParagraphStyle('Footer', fontName='ChineseFont', fontSize=10, textColor=colors.grey)))

# 生成PDF
doc.build(content)
print("✅ PDF 生成成功!")
print(f"📁 文件: 播客完整文案.pdf")

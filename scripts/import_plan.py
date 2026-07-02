"""
一建复习平台 — 数据导入脚本
将73天学习计划导入 Supabase

用法:
  1. 在 Supabase 注册账号，获取项目 URL 和 anon key
  2. 设置环境变量:
     export SUPABASE_URL=https://xxx.supabase.co
     export SUPABASE_SERVICE_KEY=eyJ...  (service_role key, 不是 anon key)
     export USER_ID=your-user-uuid
  3. 运行: python scripts/import_plan.py
"""

import os
import sys
import json
import urllib.request
import urllib.error
import urllib.parse
import time

# Fix Windows encoding issue
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
USER_ID = os.environ.get("USER_ID", "")

if not all([SUPABASE_URL, SUPABASE_KEY, USER_ID]):
    print("❌ 请设置环境变量: SUPABASE_URL, SUPABASE_SERVICE_KEY, USER_ID")
    print("   SUPABASE_SERVICE_KEY 是 service_role key，在 Supabase Dashboard > Settings > API 中找到")
    print("   USER_ID 可以在 Supabase Dashboard > Authentication > Users 中找到")
    sys.exit(1)

BASE_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}


def api(method: str, path: str, data=None):
    """Call Supabase REST API"""
    if '?' in path:
        base_path, query = path.split('?', 1)
        encoded_query = urllib.parse.quote(query, safe='=&')
        url = f"{BASE_URL}{base_path}?{encoded_query}"
    else:
        url = f"{BASE_URL}{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        resp = urllib.request.urlopen(req)
        if resp.status >= 300:
            print(f"  API error {resp.status}: {resp.read().decode()}")
            return None
        content = resp.read().decode()
        return json.loads(content) if content else {"success": True}
    except urllib.error.HTTPError as e:
        print(f"  HTTP error {e.code}: {e.read().decode()}")
        return None


# ============================================================
# 1. 创建科目
# ============================================================
print("📘 创建科目...")
subjects_data = [
    {"user_id": USER_ID, "name": "建设工程经济", "short_name": "经济", "color": "#10b981", "sort_order": 1},
    {"user_id": USER_ID, "name": "建设工程法规及相关知识", "short_name": "法规", "color": "#3b82f6", "sort_order": 2},
    {"user_id": USER_ID, "name": "建设工程项目管理", "short_name": "管理", "color": "#f59e0b", "sort_order": 3},
    {"user_id": USER_ID, "name": "建筑工程管理与实务", "short_name": "实务", "color": "#ef4444", "sort_order": 4},
]
subjects = {}
for s in subjects_data:
    result = api("POST", "/subjects", s)
    if result is None:
        # Try to fetch existing
        existing = api("GET", f"/subjects?user_id=eq.{USER_ID}&name=eq.{s['name']}")
        if existing:
            subjects[s["name"]] = existing[0]["id"]
            print(f"  ✓ {s['name']} (已存在)")
    else:
        # Fetch the inserted record
        time.sleep(0.2)
        existing = api("GET", f"/subjects?user_id=eq.{USER_ID}&name=eq.{s['name']}")
        if existing:
            subjects[s["name"]] = existing[0]["id"]
            print(f"  ✓ {s['name']}")

# ============================================================
# 2. 创建阶段
# ============================================================
print("📊 创建阶段...")
phases_data = [
    {"user_id": USER_ID, "name": "基础追赶期", "start_date": "2026-07-01", "end_date": "2026-07-20", "sort_order": 1, "description": "经济Ch15-20收尾+Ch1-12精选，实务Ch6-10，管理Ch3启动"},
    {"user_id": USER_ID, "name": "强化提升期", "start_date": "2026-07-21", "end_date": "2026-08-17", "sort_order": 2, "description": "全部视频完成，实务案例专项+分章刷题"},
    {"user_id": USER_ID, "name": "冲刺模拟期", "start_date": "2026-08-18", "end_date": "2026-09-11", "sort_order": 3, "description": "模拟卷+查漏+速记"},
]
phases = {}
for p in phases_data:
    result = api("POST", "/phases", p)
    time.sleep(0.2)
    existing = api("GET", f"/phases?user_id=eq.{USER_ID}&name=eq.{p['name']}")
    if existing:
        phases[p["name"]] = existing[0]["id"]
        print(f"  ✓ {p['name']}")

# ============================================================
# 3. 创建每日任务
# ============================================================

def get_phase_id(date_str: str) -> str:
    if date_str <= "2026-07-20":
        return phases["基础追赶期"]
    elif date_str <= "2026-08-17":
        return phases["强化提升期"]
    else:
        return phases["冲刺模拟期"]

def get_subject_id(name: str) -> str:
    mapping = {
        "经济": "建设工程经济",
        "法规": "建设工程法规及相关知识",
        "管理": "建设工程项目管理",
        "实务": "建筑工程管理与实务",
    }
    return subjects.get(mapping.get(name, name), "")

print("📋 创建每日任务...")

# 定义 73 天任务 (date, subject_short, task_content, estimated_minutes)
# 基于 generate_study_plan.py 中的详细计划

DAILY_TASKS: list[tuple[str, str, str, int]] = []

def add(date: str, subject: str, content: str, minutes: int):
    DAILY_TASKS.append((date, subject, content, minutes))

# ============ 第一阶段: 基础追赶期 (7.1-7.20) ============

# --- 第一周 7.1-7.5 ---
add("2026-07-01", "经济", "经济[15.1-15.2] 施工图预算编制(68min) ×1.5学习系数=102min≈1.7h（今晚只看15.1，15.2明晚续）", 90)
add("2026-07-02", "经济", "经济续[15.1-15.2]收尾(约30min) + [15.3] 设计概算与施工图预算审查(23min) ×1.5≈80min≈1.3h+刷题0.2h", 90)
add("2026-07-03", "经济", "经济[16.1] 工程量清单计价原理(58min) ×1.5=87min≈1.5h——2026新清单，重点章！", 90)

# 周六7.4 - 上午经济，下午实务
add("2026-07-04", "经济", "【上午】经济[16.2-16.3]最高投标限价编制(61min)×1.5=92min + [16.4-16.5]合同价款约定(51min)×1.5=77min + [17.1-17.2]合同价格调整(83min)×1.5=125min≈2.1h", 240)
add("2026-07-04", "实务", "【下午】实务(1.25x) [5.5]绿色建造(33min)+[6.1-6.3]企业资质+施组(45min)+[6.4]平面布置(36min)+[6.5]临时用电(21min)+[6.6]临时用水(26min)+[6.7]检验试验(25min)+[6.8]资料(9min)=195min≈3.3h+刷题0.7h", 240)

add("2026-07-05", "经济", "经济[17.3-17.4] 工程索赔(56min)×1.5=84min + [17.5-17.7] 合同价款争议解决(75min)×1.5=113min=197min≈3.3h", 210)

# --- 第二周 7.6-7.12 ---
add("2026-07-06", "经济", "经济[18.1-18.5] 工程总承包结算与支付(79min)×1.5=119min≈2h——2026全新章！今晚看前半(约60min)，明晚续", 90)
add("2026-07-07", "经济", "经济续Ch18收尾(约60min) + [19.1-19.3]国际工程投标(45min)×1.5=68min≈2.1h", 90)
add("2026-07-08", "经济", "经济[20.1-20.3] 大数据计价(28min)×1.5=42min >>>经济第三篇全部完成！（里程碑）剩余约0.8h：回顾Ch15-20笔记", 90)
add("2026-07-09", "经济", "经济Ch1-12精选——Ch1资金时间价值(约1h视频×1.5=1.5h) 名义利率vs有效利率+等值六大公式", 90)
add("2026-07-10", "经济", "经济Ch1-12精选——续Ch1收尾(约1h视频×1.5=1.5h) 现金流量图+六大公式练习", 90)

# 周六7.11
add("2026-07-11", "实务", "【上午】实务[7.1]招标投标(17min)+[7.2]合同管理(1)(33min)+(2)(34min)+(3)(56min)=140min/1.25=112min≈1.9h + [8.1]施工进度控制(1)(54min)+(2)(34min)=88min/1.25=70min≈1.2h——双代号网络图开篇！+刷题0.9h", 240)
add("2026-07-11", "经济", "【下午】经济Ch1-12精选：Ch2经济效果评价(1h×1.5=1.5h)+Ch7折旧(0.5h×1.5=0.75h)+Ch12 EOQ(0.5h×1.5=0.75h)=3h >>>经济全部完成！（里程碑）+考点预测Ch3-6,8-11自学1h", 240)

add("2026-07-12", "经济", "经济Ch3-6,8-11 考点预测+计算题库刷题(2h)", 120)
add("2026-07-12", "实务", "实务[8.2]进度计划编制(30min/1.25=24min)+[9.1-9.2]质量计划+检查(38min/1.25)+[9.3]质量通病防治(34min/1.25)=96min≈1.6h", 90)

# --- 第三周 7.13-7.20 ---
add("2026-07-13", "实务", "实务[9.4]质量验收管理(1)(38min/1.25)+(2)(23min/1.25)=49min+[10.1]成本计划与分解(16min/1.25)+[10.2-10.3]成本分析(40min/1.25)=105min≈1.8h", 90)
add("2026-07-14", "管理", "管理Ch3 招标投标(1)(52min)——与实务Ch7重叠+管理Ch3 招标投标(2)(45min)=97min≈1.6h", 90)
add("2026-07-15", "实务", "实务[11.1]安全生产管理计划(18min/1.25)+[11.2]安全生产检查(54min/1.25)=72min≈1.2h+安全类选择题0.3h", 90)
add("2026-07-16", "管理", "管理Ch3 招标投标(3)(30min)+合同管理(1)(113min)前半≈90min", 90)
add("2026-07-17", "实务", "实务[11.3]安全生产管理要点(1)(54min/1.25)+(2)(52min/1.25)=106min≈1.8h", 90)

# 周六 7.18
add("2026-07-18", "管理", "【上午】管理Ch3合同管理(1)收尾+合同管理(2)(70min)+风险管理及担保保险(68min)=约3.5h+刷题0.5h", 240)
add("2026-07-18", "实务", "【下午】实务[11.3]安全生产(3)(43min/1.25)+[12.1]绿色建造(18min/1.25)+[12.2]绿色施工(37min/1.25)+管理Ch4进度管理——4.1(45min)+4.2流水施工(1)(58min)=201min≈3.4h+刷题0.6h", 240)

add("2026-07-19", "管理", "管理Ch4 流水施工(2)(72min)+网络计划技术(1)(52min)=124min≈2.1h", 120)
add("2026-07-19", "实务", "实务[12.3]施工现场消防(31min/1.25)+[13.1]材料管理(36min/1.25)+[13.2]机械管理(25min/1.25)=92min≈1.5h", 90)
add("2026-07-20", "实务", "实务[13.3]劳动用工管理(33min/1.25)=26min", 30)
add("2026-07-20", "管理", "管理Ch4网络计划(2)(116min)前半≈60min", 60)

# ============ 第二阶段: 强化提升期 (7.21-8.17) ============
# W4 7.21-7.27: 管理Ch4-5收尾+法规Ch6
add("2026-07-21", "管理", "管理Ch4网络计划(3)(74min)收尾+4.4进度控制(33min)=107min", 90)
add("2026-07-22", "管理", "管理Ch5质量管理(1)(49min)+(2)(83min)——质量管理体系+抽样检验", 90)
add("2026-07-23", "管理", "管理Ch5质量管理(3)(47min)+(4)(50min)——质量控制+事故预防", 90)
add("2026-07-24", "法规", "法规Ch6 安全生产法律制度(约2h视频)", 90)
add("2026-07-25", "法规", "法规Ch6 安全生产法律制度续(约2h视频)", 90)

add("2026-07-26", "管理", "【上午】管理Ch6成本：成本计划(38min)+成本控制(44min)+成本核算(56min)+成本分析(59min)=197min≈3.3h+刷题0.7h", 240)
add("2026-07-26", "实务", "【下午】实务案例专项训练3道(2h)+批改回顾(1h)", 180)
add("2026-07-27", "法规", "法规Ch1 法律基础(约4h中的3h)", 180)

# W5 7.28-8.3: 管理收尾+法规推进
add("2026-07-28", "管理", "管理Ch7安全管理(1)(49min)+(2)(67min)=116min + 法规Ch2推进(30min)", 90)
add("2026-07-29", "管理", "管理Ch7安全管理(3)(42min)+(4)(41min)=83min + 实务案例1道(30min)", 90)
add("2026-07-30", "管理", "管理Ch8绿色建造(58min) + Ch9国际工程(1)(46min)=104min", 90)
add("2026-07-31", "管理", "管理Ch9国际工程(2)(9min)+(3)(47min)+(4)(45min)=101min", 90)
add("2026-08-01", "管理", "管理Ch10 BIM(144min)前半~72min + 法规Ch3推进(30min)", 90)

add("2026-08-02", "管理", "【上午】管理Ch10 BIM收尾(72min)+智能建造(8min) >>>管理全部完成！（里程碑）", 120)
add("2026-08-02", "法规", "【下午】法规Ch2-5推进(约4h)——施工许可+发承包+合同+安全", 240)
add("2026-08-03", "法规", "法规Ch6-8收尾+Ch9-10推进 >>>法规全部完成！>>>四科视频100%！（里程碑）", 210)

# W6 8.4-8.10: 四科分章刷题
add("2026-08-04", "经济", "经济分章刷题——Ch1-5 计算题53考点逐章练习", 90)
add("2026-08-05", "法规", "法规分章刷题——Ch1-3 法律基础+施工许可+发承包", 90)
add("2026-08-06", "管理", "管理分章刷题——Ch1-4 组织+体系+招投标+进度", 90)
add("2026-08-07", "实务", "实务分章刷题——选择题专项（单选+多选）", 90)
add("2026-08-08", "经济", "经济错题集中回顾+53计算考点最后过一遍", 90)

add("2026-08-09", "实务", "【上午】实务案例5道限时模拟(2h)+批改(2h)", 240)
add("2026-08-09", "经济", "【下午】经济53计算考点最后过一遍(2h) + 制作考前速记卡片(1h)", 180)
add("2026-08-10", "综合", "制作四科考前速记卡片（一页纸v1）", 210)

# W7 8.11-8.17: 模拟卷No.1
add("2026-08-11", "经济", "经济预测试卷No.1 全真模拟(2h)", 90)
add("2026-08-12", "法规", "法规预测试卷No.1 全真模拟(3h)", 90)
add("2026-08-13", "管理", "管理预测试卷No.1 全真模拟(3h)", 90)
add("2026-08-14", "综合", "经济+法规试卷批改分析+错题整理", 90)
add("2026-08-15", "综合", "管理试卷批改+四科成绩分析+冲刺重点清单", 90)

add("2026-08-16", "实务", "实务预测试卷No.1 全真模拟(4h)", 240)
add("2026-08-16", "综合", "实务试卷批改+分析(2h)+薄弱章回看视频(2h)", 240)
add("2026-08-17", "综合", "四科No.1成绩总分析+调整冲刺重心+速记卡修订", 210)

# ============ 第三阶段: 冲刺模拟期 (8.18-9.11) ============
# W8 8.18-8.24: 模拟卷No.2
add("2026-08-18", "经济", "经济预测试卷No.2 全真模拟(2h)", 90)
add("2026-08-19", "法规", "法规预测试卷No.2 全真模拟(3h)", 90)
add("2026-08-20", "管理", "管理预测试卷No.2 全真模拟(3h)", 90)
add("2026-08-21", "综合", "经济+法规No.2批改+逐题分析错因", 90)
add("2026-08-22", "综合", "管理No.2批改+逐题分析错因", 90)

add("2026-08-23", "综合", "2026新增考点专题复习——经济GB/T50500-2024新清单+总承包计价+BIM/AI计价", 240)
add("2026-08-23", "实务", "实务案例最后3道+2026新增考点（GB55038-2025住宅规范+绿色建造+智能建造）", 240)
add("2026-08-24", "经济", "经济53公式默写+查漏", 120)
add("2026-08-24", "综合", "法规时间节点+管理流程默写", 90)

# W9 8.25-8.31: 模拟卷No.3
add("2026-08-25", "经济", "经济预测试卷No.3 全真模拟(2h)", 90)
add("2026-08-26", "法规", "法规预测试卷No.3 全真模拟(3h)", 90)
add("2026-08-27", "管理", "管理预测试卷No.3 全真模拟(3h)", 90)
add("2026-08-28", "综合", "No.3批改+锁定顽固薄弱点", 90)
add("2026-08-29", "综合", "薄弱点回看视频(1.25x加速)+有针对练习", 90)

add("2026-08-30", "实务", "实务五星考点最后梳理(4h)", 240)
add("2026-08-30", "综合", "四科交叉回顾+\"一页纸\"定稿(4h)", 240)
add("2026-08-31", "综合", "\"一页纸背诵清单\"最终定稿+背诵", 210)

# W10 9.1-9.7: 最后冲刺
add("2026-09-01", "综合", "错题本全回顾——经济篇", 90)
add("2026-09-02", "综合", "错题本全回顾——法规篇", 90)
add("2026-09-03", "综合", "错题本全回顾——管理篇", 90)
add("2026-09-04", "综合", "错题本全回顾——实务篇", 90)
add("2026-09-05", "综合", "每天各科10道选择题+反复背诵\"一页纸\"", 90)

add("2026-09-06", "实务", "实务五大案例框架默写(4h)", 240)
add("2026-09-06", "综合", "四科考点速览+\"2026新增必考\"最后确认(4h)", 240)
add("2026-09-07", "综合", "翻错题卡+公式卡+检查考试用品+早睡", 210)

# 考前4天 9.8-9.11
add("2026-09-08", "经济", "经济公式+法规时间节点。备考试用品", 60)
add("2026-09-09", "管理", "管理流程+实务案例模板默写。22:00前睡", 60)
add("2026-09-10", "综合", "四科一页纸快速过。22:00前睡", 30)
add("2026-09-11", "综合", "不学习！确认考场路线。22:00前睡", 0)

# 考试日 9.12-9.13
add("2026-09-12", "经济", "上午9-11经济(2h) 考试", 120)
add("2026-09-12", "法规", "下午14-17法规(3h) 考试 | 考后：不看答案！不讨论！", 180)
add("2026-09-13", "管理", "上午9-12管理(3h) 考试", 180)
add("2026-09-13", "实务", "下午14-18实务(4h) 考试", 240)

# ============================================================
# 4. 插入数据库
# ============================================================
print(f"\n🚀 开始插入 {len(DAILY_TASKS)} 条任务记录...")

# Batch insert: transform into list of dicts
task_records = []
for i, (date, subject_short, content, minutes) in enumerate(DAILY_TASKS):
    subj_id = get_subject_id(subject_short)
    phase_id = get_phase_id(date)
    task_records.append({
        "user_id": USER_ID,
        "date": date,
        "subject_id": subj_id if subj_id else None,
        "phase_id": phase_id if phase_id else None,
        "task_content": content,
        "estimated_minutes": minutes,
        "sort_order": len([t for t in DAILY_TASKS[:i] if t[0] == date]),  # order within same day
        "is_completed": False,
    })

# Insert one by one
inserted = 0
errors = 0
for i, t in enumerate(task_records):
    result = api("POST", "/daily_tasks", t)
    if result is not None:
        inserted += 1
    else:
        errors += 1
        if errors <= 3:
            print(f"  ⚠ 插入失败 #{i}: {t['date']} - {t['task_content'][:50]}...")
    if (i + 1) % 10 == 0:
        print(f"  进度: {i + 1}/{len(task_records)} (成功 {inserted})")
    time.sleep(0.1)

print(f"\n✅ 完成! 成功插入 {inserted}/{len(task_records)} 条任务")
print(f"📅 覆盖日期: {DAILY_TASKS[0][0]} ~ {DAILY_TASKS[-1][0]}")
print("🎉 数据导入完成，现在可以打开应用开始使用了！")

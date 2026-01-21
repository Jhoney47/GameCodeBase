"""
GameCodeBase 管理后台 v5.0
完全适配GitHub仓库 - 双向实时同步
"""

import streamlit as st
import json
import pandas as pd
from datetime import datetime
import subprocess
import os
from typing import Dict, List, Any

# ==================== 超紧凑CSS样式 ====================
st.markdown("""
<style>
    html, body, [class*="css"] { font-size: 12px !important; }
    h1 { font-size: 18px !important; font-weight: 600 !important; margin: 0 0 8px 0 !important; }
    h2 { font-size: 16px !important; font-weight: 600 !important; margin: 0 0 6px 0 !important; }
    h3 { font-size: 14px !important; font-weight: 600 !important; margin: 0 0 4px 0 !important; }
    .block-container { padding: 1rem !important; max-width: 100% !important; }
    section[data-testid="stSidebar"] { width: 240px !important; padding: 0.5rem !important; }
    [data-testid="stMetric"] { padding: 4px 0 !important; }
    [data-testid="stMetricLabel"] { font-size: 11px !important; }
    [data-testid="stMetricValue"] { font-size: 16px !important; }
    .stDataFrame { font-size: 11px !important; }
    .stButton button { font-size: 12px !important; padding: 4px 12px !important; height: 32px !important; }
</style>
""", unsafe_allow_html=True)

st.set_page_config(
    page_title="GameCodeBase Admin",
    page_icon="🎮",
    layout="wide"
)

DATA_FILE = "GameCodeBase.json"

# ==================== GitHub同步 ====================

def git_pull() -> tuple[bool, str]:
    """从GitHub拉取最新数据"""
    try:
        result = subprocess.run(["git", "pull", "origin", "main"], capture_output=True, text=True)
        if result.returncode == 0:
            return True, "✅ 已同步GitHub最新数据"
        return False, f"❌ 拉取失败: {result.stderr}"
    except Exception as e:
        return False, f"❌ 拉取失败: {str(e)}"

def git_push(message: str = None) -> tuple[bool, str]:
    """推送更改到GitHub"""
    try:
        if message is None:
            message = f"Update - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        commands = [
            ["git", "add", DATA_FILE],
            ["git", "commit", "-m", message],
            ["git", "push", "origin", "main"]
        ]
        
        for cmd in commands:
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                if "nothing to commit" not in result.stdout.lower():
                    return False, f"❌ 推送失败: {result.stderr}"
        
        return True, "✅ 已推送到GitHub"
    except Exception as e:
        return False, f"❌ 推送失败: {str(e)}"

# ==================== 数据操作 ====================

def load_data() -> Dict[str, Any]:
    """加载JSON数据"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 确保数据结构
        if "games" not in data:
            data["games"] = []
        if "version" not in data:
            data["version"] = "2.0.0"
        if "lastUpdated" not in data:
            data["lastUpdated"] = datetime.now().isoformat() + "Z"
        if "totalCodes" not in data:
            data["totalCodes"] = sum(len(g.get("codes", [])) for g in data["games"])
        
        # 确保每个兑换码有审核状态
        for game in data["games"]:
            for code in game.get("codes", []):
                if "reviewStatus" not in code:
                    code["reviewStatus"] = "approved"
        
        return data
    except Exception as e:
        st.error(f"❌ 加载失败: {str(e)}")
        return {"version": "2.0.0", "lastUpdated": datetime.now().isoformat() + "Z", "totalCodes": 0, "games": []}

def save_data(data: Dict[str, Any], auto_push: bool = True) -> bool:
    """保存数据"""
    try:
        # 更新元数据
        data["lastUpdated"] = datetime.now().isoformat() + "Z"
        data["totalCodes"] = sum(len(g.get("codes", [])) for g in data["games"])
        
        # 更新每个游戏的codeCount
        for game in data["games"]:
            game["codeCount"] = len(game.get("codes", []))
        
        # 写入文件
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # 自动推送
        if auto_push:
            success, msg = git_push()
            if success:
                st.success(msg)
            else:
                st.warning(f"{msg}\n数据已保存到本地")
        
        return True
    except Exception as e:
        st.error(f"❌ 保存失败: {str(e)}")
        return False

# ==================== 数据转换 ====================

def codes_to_df(codes: List[Dict[str, Any]]) -> pd.DataFrame:
    """兑换码列表 → DataFrame"""
    if not codes:
        return pd.DataFrame(columns=[
            "code", "rewardDescription", "status", "sourcePlatform", 
            "codeType", "expireDate", "reviewStatus"
        ])
    
    df_data = []
    for c in codes:
        df_data.append({
            "code": c.get("code", ""),
            "rewardDescription": c.get("rewardDescription", ""),
            "status": c.get("status", "active"),
            "sourcePlatform": c.get("sourcePlatform", ""),
            "codeType": c.get("codeType", "permanent"),
            "expireDate": c.get("expireDate", ""),
            "reviewStatus": c.get("reviewStatus", "approved")
        })
    
    return pd.DataFrame(df_data)

def df_to_codes(df: pd.DataFrame, original_codes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """DataFrame → 兑换码列表"""
    codes = []
    for i, row in df.iterrows():
        original = original_codes[i] if i < len(original_codes) else {}
        
        codes.append({
            "code": str(row["code"]),
            "rewardDescription": str(row["rewardDescription"]),
            "sourcePlatform": str(row["sourcePlatform"]),
            "sourceUrl": original.get("sourceUrl", ""),
            "expireDate": str(row["expireDate"]) if row["expireDate"] else None,
            "status": str(row["status"]),
            "codeType": str(row["codeType"]),
            "publishDate": original.get("publishDate", datetime.now().isoformat() + "Z"),
            "verificationCount": original.get("verificationCount", 0),
            "reviewStatus": str(row["reviewStatus"])
        })
    return codes

# ==================== 主界面 ====================

def main():
    # 初始化session state
    if "last_sync" not in st.session_state:
        st.session_state.last_sync = None
    
    # 加载数据
    data = load_data()
    games = data.get("games", [])
    
    # ==================== 侧边栏 ====================
    with st.sidebar:
        st.markdown("### 📊 数据库")
        
        col1, col2 = st.columns(2)
        with col1:
            st.metric("游戏", len(games))
        with col2:
            st.metric("兑换码", data.get("totalCodes", 0))
        
        st.caption(f"版本: {data.get('version', 'N/A')}")
        
        st.markdown("---")
        
        # GitHub同步
        st.markdown("### 🔄 GitHub同步")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("⬇️ 拉取", use_container_width=True):
                with st.spinner("同步中..."):
                    success, msg = git_pull()
                    if success:
                        st.success(msg)
                        st.rerun()
                    else:
                        st.error(msg)
        
        with col2:
            if st.button("⬆️ 推送", use_container_width=True):
                with st.spinner("推送中..."):
                    success, msg = git_push()
                    if success:
                        st.success(msg)
                    else:
                        st.error(msg)
        
        st.markdown("---")
        
        # 游戏选择
        st.markdown("### 🎯 选择游戏")
        
        if not games:
            st.warning("暂无游戏")
            selected_idx = None
        else:
            game_options = [f"{g['gameName']} ({g.get('codeCount', 0)})" for g in games]
            selected_display = st.selectbox("游戏", options=game_options, label_visibility="collapsed")
            selected_idx = game_options.index(selected_display)
        
        st.markdown("---")
        
        # 添加游戏
        with st.expander("➕ 添加游戏"):
            with st.form("add_game", clear_on_submit=True):
                game_name = st.text_input("游戏名称", placeholder="崩坏星穹铁道")
                
                if st.form_submit_button("✅ 添加", use_container_width=True):
                    if game_name:
                        if any(g["gameName"] == game_name for g in games):
                            st.error(f"游戏 '{game_name}' 已存在")
                        else:
                            data["games"].append({
                                "gameName": game_name,
                                "codeCount": 0,
                                "codes": []
                            })
                            if save_data(data):
                                st.success("✅ 已添加")
                                st.rerun()
                    else:
                        st.error("请填写游戏名称")
    
    # ==================== 主工作区 ====================
    
    st.markdown("# 🎮 GameCodeBase Admin")
    
    tab1, tab2 = st.tabs(["📝 兑换码管理", "⏳ 待审核"])
    
    # ==================== Tab 1: 兑换码管理 ====================
    with tab1:
        if selected_idx is not None and games:
            game = games[selected_idx]
            
            # 游戏标题栏
            col1, col2, col3 = st.columns([4, 1, 1])
            with col1:
                st.markdown(f"## {game['gameName']}")
            with col2:
                st.metric("兑换码", game.get("codeCount", 0))
            with col3:
                if st.button("🗑️ 删除", key="del_game"):
                    data["games"].pop(selected_idx)
                    if save_data(data):
                        st.rerun()
            
            st.markdown("---")
            
            # 兑换码表格
            codes = game.get("codes", [])
            df = codes_to_df(codes)
            
            # 列配置
            column_config = {
                "code": st.column_config.TextColumn("兑换码", width="medium", required=True),
                "rewardDescription": st.column_config.TextColumn("奖励", width="large"),
                "status": st.column_config.SelectboxColumn(
                    "状态", 
                    width="small",
                    options=["active", "inactive", "expired"],
                    default="active"
                ),
                "sourcePlatform": st.column_config.TextColumn("来源", width="small"),
                "codeType": st.column_config.SelectboxColumn(
                    "类型",
                    width="small",
                    options=["permanent", "limited"],
                    default="permanent"
                ),
                "expireDate": st.column_config.TextColumn("过期时间", width="medium"),
                "reviewStatus": st.column_config.SelectboxColumn(
                    "审核",
                    width="small",
                    options=["approved", "pending", "rejected"],
                    default="approved"
                )
            }
            
            # 数据编辑器
            edited_df = st.data_editor(
                df,
                column_config=column_config,
                num_rows="dynamic",
                use_container_width=True,
                hide_index=True,
                key=f"editor_{selected_idx}"
            )
            
            # 保存按钮
            col1, col2 = st.columns([1, 5])
            with col1:
                if st.button("💾 保存", use_container_width=True, type="primary"):
                    new_codes = df_to_codes(edited_df, codes)
                    data["games"][selected_idx]["codes"] = new_codes
                    
                    if save_data(data):
                        st.success("✅ 已保存并推送")
                        st.rerun()
            
            with col2:
                st.caption("💡 点击表格底部 ➕ 添加，点击行号 🗑️ 删除")
            
            # 统计
            if codes:
                st.markdown("---")
                col1, col2, col3, col4 = st.columns(4)
                
                active = sum(1 for c in codes if c.get("status") == "active")
                permanent = sum(1 for c in codes if c.get("codeType") == "permanent")
                pending = sum(1 for c in codes if c.get("reviewStatus") == "pending")
                
                with col1:
                    st.metric("总数", len(codes))
                with col2:
                    st.metric("有效", active)
                with col3:
                    st.metric("永久", permanent)
                with col4:
                    st.metric("待审核", pending)
        
        else:
            st.info("👈 请在侧边栏选择或添加游戏")
    
    # ==================== Tab 2: 待审核 ====================
    with tab2:
        st.markdown("## ⏳ 待审核兑换码")
        
        pending_codes = []
        for game_idx, game in enumerate(games):
            for code_idx, code in enumerate(game.get("codes", [])):
                if code.get("reviewStatus") == "pending":
                    pending_codes.append({
                        "game_idx": game_idx,
                        "code_idx": code_idx,
                        "game_name": game["gameName"],
                        "code": code.get("code", ""),
                        "reward": code.get("rewardDescription", ""),
                        "source": code.get("sourcePlatform", "")
                    })
        
        if not pending_codes:
            st.info("✅ 暂无待审核兑换码")
        else:
            st.write(f"共 {len(pending_codes)} 个待审核")
            
            for item in pending_codes:
                with st.container():
                    col1, col2 = st.columns([5, 1])
                    
                    with col1:
                        st.markdown(f"**{item['game_name']}** - `{item['code']}`")
                        st.caption(f"奖励: {item['reward']} | 来源: {item['source']}")
                    
                    with col2:
                        col_a, col_b = st.columns(2)
                        with col_a:
                            if st.button("✅", key=f"approve_{item['game_idx']}_{item['code_idx']}"):
                                data["games"][item['game_idx']]["codes"][item['code_idx']]["reviewStatus"] = "approved"
                                if save_data(data):
                                    st.success("已通过")
                                    st.rerun()
                        with col_b:
                            if st.button("❌", key=f"reject_{item['game_idx']}_{item['code_idx']}"):
                                data["games"][item['game_idx']]["codes"][item['code_idx']]["reviewStatus"] = "rejected"
                                if save_data(data):
                                    st.warning("已拒绝")
                                    st.rerun()
                    
                    st.markdown("---")

if __name__ == "__main__":
    main()

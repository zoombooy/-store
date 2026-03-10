# NBA 商城

本项目代码统一落地在 `-store` 目录下，包含前端商城与后台管理、后端 API 与本地数据库。

## 1. 目录结构

```text
-store/
├─ frontend/                  # React + Vite + TypeScript 前端
│  ├─ src/App.tsx             # 首页、列表、购物车、后台管理 UI
│  ├─ src/constants.ts        # 球队、品牌、轮播等常量
│  ├─ src/api.ts              # API 请求封装
│  └─ ...
├─ backend/                   # Node.js + Express + TypeScript 后端
│  ├─ src/index.ts            # API 入口
│  ├─ src/services/           # 业务逻辑
│  ├─ src/routes/             # 路由
│  └─ data/                   # SQLite 数据文件
└─ README.md
```

## 2. 已实现功能

- 商城首页：轮播、品牌专区、球队专区、热门推荐
- 商品浏览：按分类、按球队、按关键字搜索
- 购物车：新增、加减、删除、浏览器本地持久化
- 管理后台：商品增删改、上下架切换、分类管理
- 统计看板：商品总数、上架数、分类数、最近更新时间
- 中文界面与视觉优化：浅色背景、玻璃质感卡片、层次阴影

## 3. 球队排序说明（按你的要求）

`frontend/src/constants.ts` 中球队顺序已调整为：

1. 湖人
2. 勇士
3. 马刺
4. 火箭
5. 凯尔特人
6. 热火
...
最后一项为：老鹰。

## 4. 技术栈

- 前端：React + Vite + TypeScript + Tailwind CSS + Lucide
- 后端：Node.js + Express + TypeScript
- 数据库：SQLite（better-sqlite3）

## 5. 本地启动与预览

在 `-store` 根目录执行：

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

一键并行开发（推荐）：

```bash
npm run dev
```

默认地址：

- 前端预览：`http://localhost:5173`
- 后端 API：`http://localhost:3001`

也可分开启动：

```bash
# 终端 1
cd backend
npm run dev

# 终端 2
cd frontend
npm run dev
```

## 6. 编译与检查

```bash
cd frontend && npm run lint && npm run build
cd ../backend && npm run lint && npm run build
```

## 7. 环境变量

`backend/.env.example`

```env
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
DB_FILE=backend/data/nba_store.db
```

`frontend/.env.example`

```env
VITE_API_BASE_URL=
```

说明：本地开发默认使用 Vite 代理，通常不填 `VITE_API_BASE_URL`。

## 8. 阶段提交记录

- `feat: bootstrap fullstack nba store workspace`
  - 完成前后端工程化改造与核心业务流程。
- `feat: add admin summary metrics endpoint and dashboard cards`
  - 增加后台汇总统计接口与看板指标。
- `docs: improve project readme with setup and preview guide`
  - 完善项目文档、部署与预览说明。
- `fix: localize ui and default data to chinese`
  - 前后端文案与默认数据改为中文。
- `feat: refine chinese navbar, team order, and premium light UI`
  - 导航品牌改为“准心贸易”；球队顺序按需求调整；浅色高质感视觉升级。

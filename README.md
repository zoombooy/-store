# NBA Store - 准心贸易（全栈版）

基于你提供的 `nba-store---准心贸易` 原型改造为可运行的前后端应用，代码全部落地在 `-store` 目录。

## 1. 项目目标

- 将原型页面转换为真实可运行的前后端代码
- 支持商品/分类管理、上架开关、检索、按球队浏览
- 提供购物车交互（本地持久化）
- 支持开发阶段实时预览

## 2. 技术栈

- 前端：React + Vite + TypeScript + Tailwind CSS + Lucide
- 后端：Node.js + Express + TypeScript
- 数据库：SQLite（`better-sqlite3`）

## 3. 目录结构

```text
-store/
├─ frontend/                # 前端应用（页面与交互）
│  ├─ src/App.tsx
│  ├─ src/api.ts
│  ├─ src/constants.ts
│  └─ ...
├─ backend/                 # 后端 API + SQLite
│  ├─ src/index.ts
│  ├─ data/
│  └─ ...
├─ package.json             # 根脚本（联动启动）
└─ README.md
```

## 4. 已实现功能

- 首页：轮播、品牌区、球队区、热门商品
- 搜索：按关键字检索商品
- 列表：按分类/球队查看商品
- 后台：
  - 商品新增、编辑、删除
  - 商品启用/禁用
  - 分类新增、删除（有商品占用时禁止删除）
  - 统计看板（商品总数、上架数量、分类数、最近更新时间）
- 购物车：
  - 添加/增减/删除
  - 本地存储（刷新后不丢失）

## 5. API 概览

- `GET /api/health`
- `GET /api/summary`
- `GET /api/categories`
- `POST /api/categories`
- `DELETE /api/categories/:id`
- `GET /api/products?includeDisabled=true`
- `POST /api/products`
- `PUT /api/products/:id`
- `PATCH /api/products/:id/status`
- `DELETE /api/products/:id`

## 6. 本地运行与预览

### 6.1 安装依赖

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 6.2 一键开发预览（推荐）

在项目根目录执行：

```bash
npm run dev
```

- 前端预览：`http://localhost:5173`
- 后端 API：`http://localhost:3001`

### 6.3 单独启动

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

### 6.4 编译检查

```bash
cd frontend && npm run lint && npm run build
cd ../backend && npm run lint && npm run build
```

## 7. 环境变量

### backend/.env.example

```env
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
DB_FILE=backend/data/nba_store.db
```

### frontend/.env.example

```env
VITE_API_BASE_URL=
```

说明：本地开发默认使用 Vite 代理，不填 `VITE_API_BASE_URL` 即可。

## 8. 阶段提交记录

- `feat: bootstrap fullstack nba store workspace`
  - 完成前后端工程化改造与主功能落地
- `feat: add admin summary metrics endpoint and dashboard cards`
  - 增加后台统计接口与管理看板指标卡
- `docs: improve project readme with setup and preview guide`
  - 完善项目文档与预览说明


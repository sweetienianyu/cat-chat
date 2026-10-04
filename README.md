# 宠物星球 PetPlanet

一个宠物展示 + 社区应用：首页瀑布流浏览宠物与养宠笔记，支持注册登录、发布内容、点赞 / 收藏 / 评论，以及后台管理。交互参考小红书（底部操作栏 + 评论区）。

- 前端：React 19 + Vite 8 + React Router 7
- 后端：FastAPI + SQLAlchemy 2.0 + PyMySQL
- 数据库：MySQL 8

## 功能一览

| 模块 | 说明 |
| --- | --- |
| 首页 | 宠物 / 笔记瀑布流，支持按热度、最新排序与关键词搜索 |
| 宠物详情 | 宠物档案、图集、相关养宠笔记 |
| 笔记详情 | 图文正文、作者信息、相关推荐 |
| 互动 | 点赞、收藏、评论（支持一级回复、删除自己的评论），计数实时同步 |
| 我的 | 我的发布、我的收藏、我的点赞 |
| 发布 | 发布宠物 / 笔记，图片支持 prompt 自动生成 |
| 登录注册 | JWT 鉴权，未登录点击互动会引导登录 |
| 管理后台 | 站点统计、内容与用户管理（仅管理员） |

## 目录结构

```
resume/
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── main.py           # 应用入口、CORS、路由注册
│   │   ├── config.py         # 读取 .env 配置
│   │   ├── database.py       # SQLAlchemy engine / session
│   │   ├── models.py         # Pet / Post / User / Like / Favorite / Comment
│   │   ├── schemas.py        # Pydantic 出入参
│   │   ├── security.py       # 密码哈希与 JWT
│   │   ├── deps.py           # 登录依赖、管理员校验
│   │   ├── seed.py           # 演示数据初始化脚本
│   │   └── routers/
│   │       ├── auth.py         # 注册 / 登录 / 当前用户
│   │       ├── pets.py         # 宠物 CRUD
│   │       ├── posts.py        # 笔记 CRUD
│   │       └── interactions.py # 点赞 / 收藏 / 评论
│   ├── requirements.txt
│   └── .env                  # 数据库连接、JWT 配置
└── frontend/                 # React 前端
    ├── src/
    │   ├── api.js            # 接口封装（fetch + token）
    │   ├── auth.jsx          # 登录态 Context
    │   ├── App.jsx           # 路由表
    │   ├── components/       # TopNav / WaterfallCard / ActionBar / Comments / ImageField
    │   ├── pages/            # Home / PetDetail / PostDetail / Login / Publish / Mine / Admin
    │   └── styles.css        # 全局样式（品牌色 --brand: #ff2442）
    ├── vite.config.js        # 端口 5173，/api 代理到 127.0.0.1:8000
    └── package.json
```

## 环境要求

- Node.js 18+（建议 20+）
- Python 3.10+
- MySQL 8.0

## 安装与启动

### 1. 准备数据库

启动本地 MySQL 后，创建数据库与账号（与 `backend/.env` 中的连接串保持一致）：

```sql
CREATE DATABASE IF NOT EXISTS petapp DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'petapp'@'%' IDENTIFIED BY 'petapp123456';
GRANT ALL PRIVILEGES ON petapp.* TO 'petapp'@'%';
FLUSH PRIVILEGES;
```

数据表无需手动建，后端启动时会自动 `create_all`。

### 2. 启动后端

```bash
cd backend

# 建议使用虚拟环境
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt

# 初始化演示数据（会清空并重建演示内容，只需执行一次）
python -m app.seed

# 启动服务
uvicorn app.main:app --reload --port 8000
```

- 接口地址：http://127.0.0.1:8000
- 接口文档（Swagger）：http://127.0.0.1:8000/docs
- 健康检查：http://127.0.0.1:8000/api/health

### 3. 启动前端

另开一个终端：

```bash
cd frontend
npm install
npm run dev
```

- 访问地址：http://localhost:5173

前端通过 Vite 代理把 `/api` 转发到 `http://127.0.0.1:8000`，因此两个服务需同时运行。

## 演示账号

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `admin123456` |
| 普通用户 | `demo` | `demo123456` |

## 配置说明（backend/.env）

```ini
DATABASE_URL=mysql+pymysql://petapp:petapp123456@127.0.0.1:3306/petapp?charset=utf8mb4
JWT_SECRET=petapp-dev-secret-change-me
JWT_EXPIRE_HOURS=168
```

- `DATABASE_URL`：数据库连接串，改用其他账号 / 端口时修改这里。
- `JWT_SECRET`：生产环境请替换为随机长字符串。
- `JWT_EXPIRE_HOURS`：登录令牌有效期（小时）。

## 常用命令

| 位置 | 命令 | 说明 |
| --- | --- | --- |
| backend | `uvicorn app.main:app --reload --port 8000` | 启动后端（开发模式） |
| backend | `python -m app.seed` | 重置并写入演示数据 |
| frontend | `npm run dev` | 启动前端开发服务器 |
| frontend | `npm run build` | 构建生产版本到 `dist/` |
| frontend | `npm run preview` | 本地预览构建产物 |

## 主要接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/register` `/api/auth/login` | 注册 / 登录 |
| GET | `/api/auth/me` | 当前登录用户 |
| GET | `/api/pets` `/api/pets/{id}` | 宠物列表 / 详情 |
| GET | `/api/posts` `/api/posts/{id}` | 笔记列表 / 详情 |
| POST | `/api/likes/toggle` | 点赞切换 |
| POST | `/api/favorites/toggle` | 收藏切换 |
| GET | `/api/me/favorites` | 我的收藏 |
| GET | `/api/comments` | 评论列表（含回复） |
| POST | `/api/comments` | 发表评论 / 回复 |
| DELETE | `/api/comments/{id}` | 删除评论（作者或管理员） |

完整参数与响应示例见 Swagger 文档。

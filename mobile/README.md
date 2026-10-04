# 宠物星球 · 移动端（React Native / Expo）

「宠物星球」的 React Native 用户端，是 Web 版（`frontend/`）移动化的实现。可浏览宠物档案与养宠笔记，支持登录注册、点赞 / 收藏 / 评论、发布与编辑笔记，交互参考小红书（底部操作栏 + 两级嵌套评论区）。

> 后端零改动，直接复用 `backend/` 的 `/api/*` REST 接口；管理后台仅保留在 Web 端，移动端不含 admin 路由。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | React Native 0.86 + React 19 |
| 运行 / 构建 | Expo（managed，SDK 57） |
| 路由 | Expo Router（文件式路由） |
| 存储 | expo-secure-store（JWT）+ 内存缓存 |
| 图片 | expo-image（磁盘 / 内存缓存） |
| 图标 | react-native-svg + @expo/vector-icons |
| 语言 | JavaScript（JSX，非 TypeScript） |

## 目录结构

```
mobile/
├── app.json                     # Expo 配置：名称/包名/scheme/插件/明文 HTTP
├── package.json
└── src/
    ├── app/                     # Expo Router 路由（每个文件即一个页面）
    │   ├── _layout.jsx          # SafeAreaProvider + AuthProvider + Stack
    │   ├── (tabs)/
    │   │   ├── _layout.jsx      # 底部 Tab：发现 / 宠物档案 / 养宠笔记 / 我的
    │   │   ├── index.jsx        # 发现
    │   │   ├── pets.jsx         # 宠物档案（品种筛选 + 最新/最热）
    │   │   ├── notes.jsx        # 养宠笔记
    │   │   └── mine.jsx         # 我的：资料 / 我的笔记 / 我的收藏 / 退出
    │   ├── pets/[id].jsx        # 宠物详情
    │   ├── posts/[id].jsx       # 笔记详情（正文 + 图集 + 互动 + 评论）
    │   ├── login.jsx            # 登录 / 注册
    │   ├── publish.jsx          # 发布笔记（?id= 为编辑态）
    │   └── +not-found.jsx
    ├── api/
    │   ├── client.js            # request() / toQuery()：fetch + token + 错误提取
    │   └── endpoints.js         # api.* 端点映射
    ├── auth/AuthContext.jsx     # user / ready / login / register / logout
    ├── lib/
    │   ├── config.js            # API_BASE 解析（见下文）
    │   └── storage.js           # token 持久化 + 同步内存缓存
    ├── hooks/useFeed.js         # feed 数据：分页、筛选、搜索、防竞态
    ├── theme/                   # tokens.js（设计变量）+ commonStyles.js
    ├── utils/                   # format.js / mappers.js
    └── components/              # AppHeader / MasonryList / WaterfallCard / ActionBar
                                 # Comments / ImageField / Select / Toast / Button 等
```

## 功能一览

| 模块 | 说明 |
| --- | --- |
| 发现 | 宠物 + 笔记合并瀑布流，下拉刷新、加载更多、下拉分页 |
| 宠物档案 | 品种 chips 筛选、最新 / 最热排序、关键词搜索 |
| 养宠笔记 | 瀑布流 + 关键词搜索 |
| 详情页 | 图集横向缩略图滚动、点赞 / 收藏（含状态锁、未登录引导登录）、评论 |
| 评论 | 两级嵌套（评论 + 回复）、500 字上限、删除二次确认 |
| 发布 | 新建与编辑同屏；图片支持填 URL 或「一句话生成配图」（无上传） |
| 我的 | 个人资料、我的笔记（编辑 / 删除）、我的收藏 |

## 环境要求

- Node.js 18+（建议 20+）
- 后端已跑通（FastAPI + MySQL，默认 `http://127.0.0.1:8000`）
- 运行方式任选其一：
  - 真机安装 **Expo Go**（注意：若新增了含原生代码的库，需改用开发构建）
  - Android 模拟器 / iOS 模拟器
  - 开发构建：`npx expo run:android` / `npx expo run:ios`

## 安装与启动

### 1. 先启动后端

移动端只是 API 消费方，务必先让后端在 8000 端口跑起来：

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

- 接口地址：http://127.0.0.1:8000
- 接口文档：http://127.0.0.1:8000/docs
- 健康检查：http://127.0.0.1:8000/api/health

首次或需要重置演示数据时：`python -m app.seed`。

### 2. 启动移动端

另开一个终端：

```bash
cd mobile
npm install
npx expo start
```

启动后按终端提示操作：

- `a` → 在 Android 模拟器打开
- `i` → 在 iOS 模拟器打开
- `w` → 在浏览器打开（Web 兜底，仅调试用）
- 手机扫码 → Expo Go 中打开

也可直接：

```bash
npm run android   # expo start --android
npm run ios       # expo start --ios
npm run web       # expo start --web
```

## API 地址如何解析（重要）

RN 没有 Web 的 Vite proxy，因此 [config.js](file:///c:/Users/Administrator/Documents/trae_projects/resume/mobile/src/lib/config.js) 按优先级解析 `API_BASE`（已含 `/api` 后缀）：

1. **`EXPO_PUBLIC_API_BASE_URL`**：最高优先级，真机连局域网后端时用它。在 `mobile/` 下新建 `.env`：

   ```ini
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.5:8000/api
   ```

   改完需重启 `npx expo start` 才生效。

2. **开发态自动推导**：读取 Expo 开发服务器的 `hostUri`，取 host 拼成 `http://<host>:8000/api`，同时适配模拟器与真机，通常无需手改。
3. **平台兜底**：Android → `http://10.0.2.2:8000/api`，iOS → `http://localhost:8000/api`。

> 注意：Android 模拟器里 `127.0.0.1` 指向模拟器自身，必须用 `10.0.2.2`；真机走局域网 IP 且手机与电脑须在同一网段。
> 后端无 TLS，`app.json` 已通过 `expo-build-properties` 开启 `usesCleartextTraffic`，仅限开发。

## 演示账号

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `admin123456` |
| 普通用户 | `demo` | `demo123456` |

## 测试

本项目**没有引入自动化测试框架**（无 Jest / 测试脚本），验证以「静态检查 + 真机 / 模拟器手动全流程」为主。

### 静态检查

在 `mobile/` 下执行：

```bash
npx expo-doctor       # 诊断依赖版本与 Expo 配置问题
npx expo install --fix # 一键修正与 SDK 不兼容的依赖版本
npx expo lint         # 代码检查（首次运行会引导初始化 ESLint 配置）
```

> 工程为 JS（无 `tsconfig.json`），故不使用 `npx tsc --noEmit` 做类型检查。

### 手动回归清单（核心流程）

按顺序在模拟器或真机上走一遍：

1. **连通性**：发现页能加载出宠物 / 笔记，说明 `API_BASE` 解析与明文 HTTP 均通。
2. **登录态**：用 `demo / demo123456` 登录；杀掉 App 重开仍保持登录（`api.me()` 恢复会话）；「我的」中退出后登录态清空；错误密码显示后端返回的中文提示。
3. **Feed**：三个 Tab 切换正常；品种筛选、最新 / 最热、关键词搜索生效；加载更多无重复；加载中切换筛选条件不出现旧数据残留。
4. **互动**：详情页点赞 / 收藏计数实时更新；未登录点击互动跳转登录页且**不发请求**；初始状态未拉取完时按钮禁用；快速连点只发一次请求；收藏出现「已收藏 / 已取消收藏」toast（约 1.6s）。
5. **详情切换**：从笔记 1 进入笔记 2，心 / 星状态与评论区无残留（id 变化重置）。
6. **评论**：发表评论计数 +1；回复为两级缩进；删除自己的评论弹原生确认；输入框 500 字上限。
7. **发布 / 编辑**：登录后发布笔记（配图可用 URL 或生成），在 Feed 与「我的」可见；编辑回填并保存；删除后从「我的」消失。
8. **我的收藏**：同时包含宠物与笔记两类，瀑布流正常。
9. **真机专项**：设置 `EXPO_PUBLIC_API_BASE_URL` 后走完整流程；注意中文字体渲染、键盘避让（评论 / 发布表单）、刘海安全区；控制台无红 / 黄日志框。

### 常见问题

| 现象 | 排查方向 |
| --- | --- |
| 页面一直加载 / 请求失败 | 后端是否在 8000 运行；`EXPO_PUBLIC_API_BASE_URL` 是否为电脑局域网 IP；手机与电脑是否同网段 |
| Android 模拟器连不上 | 确认走的是 `10.0.2.2` 兜底地址 |
| 改了 `.env` 不生效 | 需重启 `npx expo start` |
| 新增含原生代码的库后打不开 | Expo Go 不含该原生模块，改用 `npx expo run:android` 或开发构建 |

## 与 Web 版的差异

- 顶栏的「发现 / 宠物档案 / 养宠笔记」改为**底部 Tab**，去掉 `?tab=` query 耦合。
- 详情页图片画廊改为横向 `ScrollView` 缩略图；锚点滚动改用 `ScrollView` ref + `onLayout`。
- `select` → 自研 `Select`（Modal），`window.confirm` → `Alert.alert`。
- 不含管理后台路由。
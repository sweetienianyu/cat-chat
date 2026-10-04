# 宠物星球 · React Native（Expo）用户端迁移计划

## Context（背景与目标）

现有应用「宠物星球」为 Web 三端：`frontend/`（React 19 + Vite + react-router-dom v7 + 纯 CSS）、`backend/`（FastAPI + SQLAlchemy + MySQL，REST + JWT）。

用户希望把**用户端**迁移到 React Native，以覆盖移动端体验。经评估确认：

* **后端零改动**：`/api/*` 为标准 REST，CORS 已 `allow_origins=["*"]`，RN 直接消费。

* **管理后台不迁移**：`frontend/src/pages/Admin.jsx` 与 `/api/admin/stats` 保留在 Web 端（移动端不适合表格后台）。

* **无文件上传**：后端无任何 `UploadFile`/`multipart`，所有图片都是外部 URL（`utils.js` 的 `buildImageUrl` 生成或手填），因此**不需要图片选择器与上传流程**。

* **技术选型（已确认）**：React Native + **Expo（managed）** + **JavaScript/JSX**。

预期结果：在 `mobile/` 下新建 Expo 应用，复用现有 api/auth/utils 逻辑与设计 token，逐屏移植 6 个用户端页面 + 4 个组件，最终在 Android 模拟器/真机上跑通「浏览 → 详情 → 点赞/收藏 → 评论 → 发布 → 我的 → 退出」全流程。

***

## 一、工程形态与关键差异

**Expo managed + Expo Router。** 理由：无任何自定义原生代码；Expo Router 的文件式路由与现有 `react-router` 路径结构几乎 1:1；内置 `expo-image`（图片磁盘缓存，对瀑布流关键）、`expo-secure-store`、`expo-linear-gradient`。

### API 地址（与 Web 最大的差异）

Web 靠 Vite proxy 把 `/api` 转发到 `127.0.0.1:8000`（见 [vite.config.js](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/vite.config.js#L8-L13)）。RN 没有 dev proxy，需新增 `mobile/src/lib/config.js`，按优先级解析 `API_BASE`（含 `/api` 后缀）：

1. `EXPO_PUBLIC_API_BASE_URL`（最高优先，真机用局域网 IP）
2. 开发态自动推导：`expo-constants` 的 `Constants.expoConfig.hostUri`（如 `192.168.1.5:8081`）取 host → `http://<host>:8000/api`，**同时适配模拟器与真机，无需手改**
3. 平台兜底：`Platform.select({ android: 'http://10.0.2.2:8000/api', ios: 'http://localhost:8000/api' })`

> Android 模拟器的 `127.0.0.1` 指向模拟器自身，必须用 `10.0.2.2`。

***

## 二、目录结构

新建 `mobile/`，与 `frontend/`、`backend/` 平级。**`frontend/`** **保持不动**（Web 端与后台继续可用）。

```
mobile/
  app.json / app.config.js        # scheme、android package、明文 HTTP 配置
  .env                            # EXPO_PUBLIC_API_BASE_URL（真机覆盖用）
  app/                            # Expo Router 路由
    _layout.jsx                   # SafeAreaProvider + AuthProvider + Stack(headerShown:false)
    (tabs)/
      _layout.jsx                 # 底部 Tab：发现 / 宠物 / 笔记 / 我的
      index.jsx                   # 发现（原 Home tab=discover）
      pets.jsx                    # 宠物档案
      notes.jsx                   # 养宠笔记
      mine.jsx                    # 我的（原 Mine.jsx）
    pets/[id].jsx                 # PetDetail
    posts/[id].jsx                # PostDetail
    login.jsx
    publish.jsx                   # 编辑态通过 params.id
    +not-found.jsx
  src/
    api/client.js                 # request() / toQuery() / token 读写
    api/endpoints.js              # api.* 端点映射（原样）
    auth/AuthContext.jsx          # 由 frontend/src/auth.jsx 迁移
    lib/config.js                 # API_BASE 解析
    lib/storage.js                # token 持久化 + 内存缓存
    utils/format.js               # timeAgo / compactNumber / parseTags / cardRatio / buildImageUrl
    utils/mappers.js              # toPetCard / toPostCard / avatarFallback
    theme/tokens.js               # 颜色/圆角/间距/字号/阴影
    theme/commonStyles.js         # 共享 StyleSheet
    components/
      AppHeader.jsx               # 原 TopNav.jsx
      WaterfallCard.jsx
      MasonryList.jsx             # 新增：两列均衡瀑布流
      ActionBar.jsx
      Comments.jsx
      ImageField.jsx
      Select.jsx                  # 新增：替代 <select> 的 Modal 选择器
      Toast.jsx                   # 新增：从 ActionBar 抽出的 toast
      Chip.jsx / Button.jsx / Skeleton.jsx / EmptyState.jsx
```

**导航形态调整**：Web 把「发现/宠物档案/养宠笔记」放在顶栏并用 `?tab=` 驱动；移动端提升为**底部 Tab**，并**去掉 query 参数耦合**（关键词/筛选改为屏幕内部 state）。详情/登录/发布为 Stack 页压在 Tab 之上。`/admin` 路由删除。

***

## 三、依赖选型

| 关注点      | 选择                                                                                    | 说明                                                          |
| -------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 路由       | `expo-router`                                                                         | `useLocalSearchParams` 同时替代 `useParams` 与 `useSearchParams` |
| Token 存储 | `expo-secure-store` + 内存缓存                                                            | JWT 敏感；缓存使 `getToken()` 保持同步，最小化对 AuthProvider 的改动          |
| 图片       | `expo-image`                                                                          | 磁盘+内存缓存，`contentFit="cover"`                                |
| 瀑布流      | 先手写两列均衡，量大再换 `@shopify/flash-list` v2 masonry                                         | 手写版用确定性 `cardRatio` 复刻 Web 效果，零依赖                           |
| 图标       | `react-native-svg` + `@expo/vector-icons`                                             | 点赞/收藏/评论三个功能性图标沿用现有 `<Path d=...>` 数据                       |
| Toast    | 自研 `Toast.jsx`（Animated.View）                                                         | 复刻 ActionBar 的 1.6s toast                                   |
| 弹窗       | `Alert.alert`                                                                         | 替代 `window.confirm`                                         |
| 下拉选择     | 自研 `Select`（Modal + FlatList）                                                         | 替代宠物选择器与图片尺寸选择                                              |
| 表单/键盘    | RN 内置 `TextInput` + `KeyboardAvoidingView`                                            | 表单简单，无需表单库                                                  |
| 动效/安全区   | `react-native-reanimated` / `react-native-safe-area-context` / `expo-linear-gradient` | 首页渐变、刘海适配                                                   |

移除 `axios`（当前未使用）与 `react-router-dom`。

***

## 四、复用策略

**近乎原样拷贝：**

* [utils.js](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/utils.js)（100% 纯 JS，无 DOM）→ `utils/format.js` + `utils/mappers.js`。`cardRatio` 的稳定高度正是瀑布流所需。

* [api.js](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/api.js) 的 `api.*` 端点映射与 `toQuery()` —— 逐行不变。

* [auth.jsx](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/auth.jsx) 的 Provider 结构（`user/ready/login/register/logout` + 挂载时 `api.me()` 恢复会话）。

**必须改动：**

* `request()`：`fetch(\`/api${path}\`)` → `fetch(\`${API\_BASE}\${path}\`)`；token 改由 ` storage`读取。保留`204 → null`、JSON 解析兜底、`detail\[0].msg\` 错误提取逻辑。

* `localStorage` → `storage.js`（仍用 key `pet_token`）。

* 路由 API：`useNavigate` → `useRouter().push/replace/back`；`useParams`/`useSearchParams` → `useLocalSearchParams`；`<Link to>` → expo-router `<Link href>` 或 `Pressable`。

* DOM → RN 原语：`div`→`View`、文本必须包 `Text`、`img`→`expo-image`、`button`→`Pressable`、`input`→`TextInput`、`textarea`→`TextInput multiline`、`select`→`Select`、表格→行列表。

* [PetDetail.jsx](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/pages/PetDetail.jsx) 的 `document.getElementById(...).scrollIntoView` → `ScrollView` ref + `onLayout` 测量 `y` 后 `scrollTo`。

* `window.confirm` → `Alert.alert`。

* `aspectRatio: '1 / ratio'` → `{ aspectRatio: 1 / ratio }`（RN 用数值）。

***

## 五、逐屏迁移要点

* **App 外壳** `app/_layout.jsx`：`SafeAreaProvider` → `AuthProvider` → `Stack`；`ready` 为 false 时显示轻量 splash。

* **Tab 外壳** `app/(tabs)/_layout.jsx`：四个 Tab（发现/宠物/笔记/我的）+ Ionicons。

* **AppHeader**（原 [TopNav.jsx](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/components/TopNav.jsx)）：品牌爪印 + 搜索 `TextInput` + 头像/登录；移除后台入口。

* **首页三 Tab**：共用一个 `useFeed(tab)`。**保留** `reqKey` 的 `useMemo` + `latest.current` 签名守卫与 `cancelled` 清理（防竞态）。发现页保留 `Promise.all` 合并 pets+posts 并按 `time` 排序；宠物页保留品种 chips + 最新/最热；搜索改本地 state。`toggleLike` 未登录时 `router.push('/login')` 且**不发请求**。

* **MasonryList**：按 `item.ratio` 累加分配到两列以保持均衡；`WaterfallCard` 用 `React.memo`。

* **WaterfallCard**：外层 `Pressable` 跳转，点赞按钮嵌套 `Pressable`（RN 事件不冒泡，**删除** Web 的 `preventDefault`/`stopPropagation`）；封面 `aspectRatio: 1/ratio` + `contentFit="cover"`。

* **PetDetail / PostDetail**：**完整保留** id 变化时的状态重置 effect、`likeLock`/`favLock` ref 锁、`statusReady` 标志（初始状态未拉取完时禁用按钮）、未登录跳转语义。PostDetail 的编辑/删除：`Alert.alert`（destructive）→ `api.deletePost` → `router.back()`。画廊缩略图改横向 ScrollView；`.info-grid` 改 `flexWrap` 两列。

* **ActionBar**：三个 SVG 图标沿用现有 path 数据；`Pressable` + `disabled={likeBusy}`；`on` 色 `#ff2442`；抽出 `Toast`，保留 1600ms 计时与 `clearTimeout` 清理、已收藏/已取消收藏文案、`extra` 插槽。

* **Comments**：移植两级嵌套 `CommentItem`（`comment` + `comment.replies[]`）、回复提示、缩进、`canDelete`。输入框保留 `maxLength={500}`；Enter 提交改 `onSubmitEditing` + `returnKeyType="send"` + `blurOnSubmit={false}`；删除用 `Alert.alert`；50 条用 `.map()` 渲染避免嵌套 VirtualizedList 警告；保留 `onCountChange`。

* **Publish**：`useLocalSearchParams().id` 取编辑态；`ready && !user` 时提示登录。字段：标题 `TextInput`(maxLength 120)、内容 `TextInput multiline`、标签、宠物 `Select`（选项来自 `api.pets({size:50})`）、`ImageField`。提交载荷不变（`parseTags` / `pet_id` / `cover_image: images[0]`），成功后 `router.push('/posts/'+id)`。

* **ImageField**：URL 输入 + 添加；生成区块（prompt 输入 + 尺寸 `Select`）调用 `buildImageUrl` 不变；预览网格 + 遮罩 × 删除。**全程无上传**。

* **Mine**：资料面板 + 发布入口 + 退出（`logout` + `router.replace('/')`）；我的帖子：表格改行列表（缩略图 + 标题 + 点赞/浏览 + 编辑/删除，删除用 `Alert.alert`）；收藏瀑布流用 `toPetCard`/`toPostCard`。

* **Login**：登录/注册切换，`secureTextEntry` + `autoCapitalize="none"`，成功 `router.replace('/')`（用 replace 防止回退到登录页）。

* **Admin**：不迁移，从路由移除。

***

## 六、主题：CSS 变量 → 设计 token

**不要逐行翻译 981 行 CSS。** 将 `:root` 变量转成 token，再手写一份覆盖高频族类的共享 StyleSheet。

* `theme/tokens.js`：颜色（`brand #ff2442`、`brandDark #e01b36`、`brandSoft #fff0f2`、`text1/2/3`、`bg #f6f7f9`、`card #ffffff`、`line #efefef`）、圆角（18/12/8/999）、间距（4/8/12/16/24/32）、字号（26/20/16/14/13/12）、阴影（**必须含** **`elevation`**，Android 忽略 iOS 阴影属性）。

* `theme/commonStyles.js`：约 12–15 个命名样式覆盖约 80% 场景（screen/panel/card/cardCover/chip/btn 系列/input/formError/sectionTitle/avatar/tag/actionItem/comment\*）。Web 已大量使用内联样式，保持内联数组叠加基础样式。

* 转换规则：去掉 `max-width`/`margin:0 auto`；`min-height:100vh`→`flex:1`；`.topnav` 的 `position:fixed`+`backdrop-filter` → 滚动区外的 Header 组件（可加 `expo-blur`）；`.info-grid` grid → `flexWrap` 行；**不设置** **`fontFamily`**（Android 设西文字体易出豆腐块，交给系统中文字体栈）；`.page` 的 84px 上内边距 → `useSafeAreaInsets`。

***

## 七、分阶段里程碑与验证

**Phase 0 — 脚手架 + 连通性**
`create-expo-app` 生成 `mobile/`；加 `lib/config.js`、`lib/storage.js`；临时页面调 `api.pets({size:1})`。
*验证*：`npx expo start` 在 Android 模拟器渲染出 1 个宠物名，证明模拟器网络与明文 HTTP 均通。

**Phase 1 — 基础设施 + 鉴权**
移植 theme、utils、api client、AuthContext；搭根布局、Tab 外壳、AppHeader、Login。
*验证*：用 `demo/demo123456` 登录；杀进程重启仍保持登录（`api.me()` 恢复）；退出清空；错误密码显示后端 `detail` 文案。

**Phase 2 — 首页 feed 端到端**
`useFeed`、`MasonryList`、`WaterfallCard`、Skeleton/EmptyState/Chip、Hero。三 Tab、筛选、搜索、分页、点赞全部接通。
*验证*：发现页 pets+posts 按时间合并；品种/最新/最热生效；加载更多无重复；加载中切换品种不出现旧数据；点赞更新计数；未登录点赞跳登录且**不发请求**。

**Phase 3 — 详情 + 交互**
PetDetail、PostDetail、ActionBar（SVG 图标 + toast）、Comments。
*验证*：初始 like/favorite 在途时操作按钮禁用（`statusReady`）；快速连点只发一次请求；收藏显示 toast；评论计数更新、回复嵌套缩进、删除弹原生确认；点「评论」滚动到位；post 1 → post 2 切换后心/星状态无残留。

**Phase 4 — 发布 + 我的**
Publish（新建+编辑）、ImageField、Mine（资料/我的帖子/收藏/删除）。
*验证*：用**生成图片 URL** 发帖并在 feed 与「我的」可见；编辑回填并保存；删除后从「我的」消失；收藏同时含宠物与笔记。

**Phase 5 — 打磨**
下拉刷新、上拉加载、键盘避让、安全区、加载/空态、Android 物理返回、删除 admin 路由、主题间距微调。
*验证*：真机走局域网 IP（设 `EXPO_PUBLIC_API_BASE_URL` 后重启 `expo start`）跑完整流程（浏览→详情→点赞收藏→评论→发布→我的→退出）；无红/黄日志框；刘海与键盘下无裁切。

***

## 八、风险与注意点

* **模拟器网络**：`127.0.0.1` 指模拟器自身，须用 `10.0.2.2` 或局域网 IP；`hostUri` 自动推导可免手改。

* **明文 HTTP**：Android 9+ 默认禁 http。Expo Go 开发态宽松，但 prebuild/dev build 需经 `expo-build-properties` / `usesCleartextTraffic` 开启（后端无 TLS），仅限开发并记录。

* **图片宽高比**：用确定性 `cardRatio`（`aspectRatio: 1/ratio`），不测量真实尺寸（异步且会跳动）。

* **Emoji 图标**：❤️/🤍/🐾/🙈 在 Android 各家渲染不一致；功能性图标改用 `react-native-svg` 沿 path 数据；所有文本片段必须包在 `<Text>` 内。

* **中文字体**：Android 勿设西文 `fontFamily`，真机核验 CJK。

* **键盘**：评论输入与发布表单是重点，`KeyboardAvoidingView` + `keyboardShouldPersistTaps="handled"`。

* **瀑布流性能**：两列独立 View 失去跨列虚拟化；量大时换 FlashList v2 masonry 并 memo 卡片。

* **嵌套列表警告**：50 条评论用 `.map()` 渲染，不套 `FlatList`。

* **导航状态残留**：`[id]` 重置 effect 原样保留（这是此前 Web 端状态残留 bug 的修复）；若同名 push 复用实例，给 Stack 加 `getId={({params}) => params.id}` 强制重挂载。

* **残留 DOM 调用**：移植后 grep `window`/`document`/`localStorage`/`navigator`，逐个替换。

* **Hermes 运行时**：`toQuery` 的 `URLSearchParams` 与 `timeAgo` 超 30 天的 `toLocaleDateString('zh-CN')`（依赖 ICU）需在 Android 冒烟，必要时改手写实现。

***

## 关键文件（实现时参考）

* [frontend/src/api.js](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/api.js) — 端点映射与 request 封装

* [frontend/src/auth.jsx](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/auth.jsx) — 鉴权 Provider

* [frontend/src/utils.js](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/utils.js) — 纯逻辑工具，直接复用

* [frontend/src/pages/Home.jsx](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/pages/Home.jsx) — feed 与防竞态逻辑

* [frontend/src/pages/PetDetail.jsx](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/pages/PetDetail.jsx) — 锁与 statusReady 语义

* [frontend/src/components/Comments.jsx](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/components/Comments.jsx) — 两级嵌套评论

* [frontend/src/styles.css](file:///c:/Users/Administrator/Documents/trae_projects/resume/frontend/src/styles.css) — token 与样式族来源


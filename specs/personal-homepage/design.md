# Design

## Spec Metadata

- Feature: `personal-homepage`
- Status: `approved`
- Last updated: `2026-09-28`
- Requirements source: `requirements.md`（approved 2026-09-28）

## Overview

首版采用 **Astro 静态站点 + TypeScript 客户端模块 + GitHub Actions / GitHub Pages**。核心内容在构建时生成 HTML，使 About Me、Education、Research、Publications 和两个 Misc 在没有 JavaScript、音频或 AI 后端时仍可阅读。启动界面、单板块切换、terminal、背景音乐和随机吉他音符作为渐进增强加载。

视觉上直接继承参考主页已经核实的结构：`INSERT COIN` 启动层、`Press Start 2P` 像素字体、像素头像、ASCII 信息框、编号菜单和单板块展开。配色改为浅蓝粉彩终端：浅蓝画布、冰白正文面、薄荷绿和淡紫辅助面、柔和珊瑚强调，以及保证文字对比度的深蓝灰。个人化内容替换为 Manting Guo 的教育与研究资料，并通过健身、阅读、吉他、《La La Land》和《Normal People》形成两个 Misc 板块及声音互动。

个人站直接部署到现有 `kingsley-wade/kingsley-wade.github.io`，继续使用 `https://kingsley-wade.github.io/`。仓库当前在 `master` 分支以 legacy Jekyll 发布 Contrast 主题；迁移时先创建恢复 tag，再用 Astro 文件替换旧主题并把 Pages Source 切换到 GitHub Actions。首次迁移保留 `master`，稳定后再考虑改名为 `main`。个人站验证完成后，从相同的通用组件、module contract 和配置结构整理独立的 `pixel-terminal-homepage` GitHub Template 仓库。

## Design Decisions

| 议题 | 采用方案 | 原因 |
| --- | --- | --- |
| 页面框架 | Astro 静态输出 | 学术内容默认生成 HTML；客户端只为互动加载；适合 GitHub Pages 和 VPS 静态托管 |
| 客户端状态 | 原生 TypeScript 小模块 | 当前交互规模不需要完整 SPA；避免额外框架和大体积运行时 |
| 内容维护 | Markdown/YAML 内容集合 + schema 校验 | 便于手工编辑、Git 审阅和后续新增板块 |
| 模块扩展 | `SectionManifest` + 可选自定义 renderer | 普通板块只加配置与内容；复杂功能通过稳定接口接入，不修改页面壳 |
| 样式 | 原生 CSS、语义 theme tokens 和主题 preset | 精确实现像素/terminal 视觉，同时让模板使用者集中换色 |
| 发布 | GitHub Actions 构建并部署现有 Pages 仓库 | `push master` 自动同步；构建失败不替换当前线上版本 |
| 音频 | 背景曲使用一个 `HTMLAudioElement`；按键吉他音使用 Web Audio API | 背景曲需要暂停/进度/音量；短音效需要低延迟、限流和随机音阶 |
| AI 接口 | 前端 adapter + 未来独立 HTTPS 服务 | GitHub Pages 不能安全保存密钥或直接管理私人笔记 |
| 模板发布 | 独立 GitHub Template 仓库 + 中性示例站 | 个人资料与通用代码隔离，其他人可直接 Use this template |

## Reference Mapping

| 参考主页特征 | 本站保留方式 | 本站差异 |
| --- | --- | --- |
| `INSERT COIN` 黑色启动层 | 浅蓝全屏启动层、闪烁提示、Enter 与触屏按钮 | 保留街机仪式，提供 `START WITH SOUND` 和 `ENTER MUTED` |
| 像素头像 + ASCII 身份框 | 左侧原创像素头像，右侧终端身份框 | 使用两张本地照片制作头像；身份改为 Manting Guo、SJTU、Applied Mathematics / Agent Systems |
| `Press Start 2P` 与荧光配色 | 标题和菜单使用本地托管像素字体；正文使用易读等宽字体 | 改为浅蓝、冰白、薄荷、淡紫和珊瑚粉彩体系；长文使用深蓝灰正文 |
| `[1]` 至 `[7]` 菜单 | `[1]` 至 `[6]` 键盘快捷导航 | 对应 About Me、Education、Research、Publications、Misc 01、Misc 02 |
| 点击只显示一个正文板块 | URL hash 与当前板块同步；后退/前进可恢复 | 无 JavaScript 时六个板块按顺序全部显示 |
| 入场 `coin.mp3`、菜单 `click.mp3` | 入场音效和每次菜单操作的短音效 | 菜单音改为按栏目音阶随机出现的吉他拨弦音，并新增独立背景音乐 |

## Repository Tree Impact

```text
repository/
  .github/
    workflows/
      deploy-pages.yml
  docs/
    CONTENT_GUIDE.md
    DEPLOYMENT.md
    MODULE_DEVELOPMENT.md
    REFERENCE_COMPARISON.md
    ASSISTANT_INTEGRATION.md
    TEMPLATE_MAINTENANCE.md
  public/
    fonts/
      press-start-2p.woff2
    images/
      avatar-pixel.webp
      avatar-pixel@2x.webp
    audio/
      guitar/
        guitar-note-C4.ogg
      mock/
        theme-placeholder.ogg
  src/
    components/
      AppShell.astro
      SplashGate.astro
      PixelPortrait.astro
      TerminalIdentity.astro
      TerminalMenu.astro
      ContentPanel.astro
      AudioControls.astro
      PlaygroundTerminal.astro
      AssistantStatus.astro
    config/
      audio.ts
      site.ts
      theme.ts
    content/
      about/
        index.md
      education/
        sjtu-graduate.yaml
        sjtu-undergraduate.yaml
      research/
        arranged-forests.md
      publications/
        .gitkeep
      misc/
        life.md
        playground.md
    content.config.ts
    core/
      section-contract.ts
      section-registry.ts
    layouts/
      BaseLayout.astro
    lib/
      assistant/
        adapter.ts
        disabled-adapter.ts
        http-adapter.ts
        contracts.ts
      audio/
        audio-controller.ts
        guitar-note-engine.ts
        scales.ts
      content/
        public-content.ts
      terminal/
        commands.ts
        parser.ts
    modules/
      about/
        manifest.ts
      education/
        manifest.ts
      research/
        manifest.ts
      publications/
        manifest.ts
      life/
        manifest.ts
      playground/
        manifest.ts
    pages/
      api/
        v1/
          content.json.ts
      index.astro
    styles/
      global.css
      tokens.css
    themes/
      presets.ts
  scripts/
    create-template-snapshot.mjs
    verify-template-boundary.mjs
  template-seed/
    content/
      about.md
      example-section.md
    public/
      avatar-placeholder.webp
      theme-placeholder.ogg
    site.ts
    theme.ts
  tests/
    e2e/
      homepage.spec.ts
      audio.spec.ts
      accessibility.spec.ts
    fixtures/
      publications.mock.ts
    unit/
      assistant-adapter.test.ts
      content-schema.test.ts
      guitar-note-engine.test.ts
      terminal-parser.test.ts
  .env.example
  LICENSE
  THIRD_PARTY_NOTICES.md
  TEMPLATE_UPSTREAM.md
  astro.config.mjs
  package.json
  pnpm-lock.yaml
  tsconfig.json
```

根目录 `1.jpg`、`idphoto.jpg` 和 `cvfor_applied_math/` 只作为制作输入。部署流程只上传 `dist/`；将确认公开的资料迁入 `src/content/` 后，原始输入不复制到远端个人仓库。新代码采用 MIT 许可证，第三方字体和音频在 `THIRD_PARTY_NOTICES.md` 分别记录；旧 Contrast 主题仍可在恢复 tag 中按其 Unlicense 查看。

## Architecture

```mermaid
flowchart LR
    C[Markdown / YAML content] --> B[Astro build]
    CFG[Site, theme, audio config] --> B
    M[Section manifests and modules] --> B
    B --> H[Static HTML, CSS, JS]
    B --> J[/api/v1/content.json]
    H --> P[GitHub Pages]
    J --> P
    P --> V[Visitor browser]
    V --> A[Audio controller]
    V --> T[Local terminal commands]
    V -. optional HTTPS .-> G[Future assistant gateway]
    G --> N[Private notes store]
    B -. sanitized snapshot .-> TR[Reusable template repository]
```

边界如下：

1. **内容边界**：CV 中确认公开的事实转换为 schema 校验过的内容文件。页面和公开 JSON 从同一份内容生成。
2. **展示边界**：Astro 组件只负责结构与静态渲染；视觉 token 负责颜色、字体、间距和减少动画模式。
3. **互动边界**：浏览器 TypeScript 处理板块切换、键盘导航、terminal 和声音，不执行任意命令。
4. **模块边界**：section manifest 描述导航、内容、renderer、音阶与命令；registry 负责组合，不允许模块修改页面壳。
5. **部署边界**：`dist/` 是可移植产物。GitHub Pages 和未来 Nginx 都只托管该目录。
6. **模板边界**：通用代码、示例内容和可再分发资源可以进入模板；个人 identity、CV、头像、邮箱和商业音轨禁止进入模板快照。
7. **AI 边界**：公开站点不保存模型或笔记凭证。未来网关承担认证、授权、模型调用和私人笔记存储。

## Components

| Component | Responsibility | Inputs | Outputs | Depends on |
| --- | --- | --- | --- | --- |
| `BaseLayout` | HTML metadata、字体预加载、全局样式、基础无 JS 内容 | site config、页面内容 | 完整静态文档 | Astro、CSS |
| `SplashGate` | 声音进入/静音进入、Enter 键、减少动画 | sound preference | 进入事件、声音授权状态 | audio controller |
| `TerminalIdentity` | 像素头像旁的 ASCII 身份信息 | profile config | 身份框 | PixelPortrait |
| `TerminalMenu` | 从注册表生成编号菜单、键盘与 hash 导航 | section registry | section change event | router helper、audio controller |
| `ContentPanel` | 当前板块内容与无 JS 顺序内容 | content collection | 可读正文 | Astro content |
| `AudioControls` | 背景曲播放/暂停、静音、音量、当前曲目信息 | audio state | audio commands | audio controller |
| `GuitarNoteEngine` | 按栏目音阶随机选择拨弦音、限流、避免连续重复 | section ID、RNG、sample manifest | short note playback | Web Audio API |
| `PlaygroundTerminal` | 白名单命令解析和兴趣彩蛋 | terminal command | 本地确定性输出 | terminal parser、audio controller |
| `AssistantStatus` | 显示未连接、可连接或已认证状态 | assistant config、health result | 状态与登录入口 | assistant adapter |
| `PublicContentEndpoint` | 从同一内容源生成版本化公开 JSON | validated content、revision | `/api/v1/content.json` | Astro static endpoint |

## Theme System

个人站默认 preset 名为 `pastel-sky`。浅色只用于背景与装饰面，交互文字始终使用经过对比度检查的深色。

| Token | Default | Usage |
| --- | --- | --- |
| `--canvas` | `#DDEFFC` | 页面与启动层浅蓝背景 |
| `--surface` | `#F8FCFF` | 正文内容面 |
| `--surface-mint` | `#DDF4E8` | Life、成功状态和次级区域 |
| `--surface-lavender` | `#E9E1F7` | Research、AI 状态和装饰区域 |
| `--surface-coral` | `#F6D7DF` | 当前菜单背景和小范围强调面 |
| `--ink` | `#18324A` | 正文与主要边框 |
| `--ink-muted` | `#49657A` | 次要说明文字 |
| `--link` | `#075E75` | 链接与可点击菜单 |
| `--accent` | `#96324F` | coin 文字、当前板块与强调点 |
| `--highlight` | `#8A5B00` | 警告、声音状态和黄色替代强调 |
| `--focus` | `#6B4FA1` | 键盘焦点轮廓 |
| `--terminal-border` | `#49657A` | ASCII/CSS terminal 边框，满足浅色背景对比度 |

`src/config/theme.ts` 只选择 preset 或覆盖 token；组件不得硬编码品牌色。通用模板除 `pastel-sky` 外提供 `classic-terminal` 示例 preset，说明用户如何新增自己的主题。构建检查验证必需 token 完整，自动化视觉检查验证正文、链接、按钮和焦点对比度。

## Section and Module Extension Contract

普通内容板块通过 `SectionManifest` 注册。构建时 `section-registry.ts` 使用 `import.meta.glob` 自动发现 `src/modules/*/manifest.ts`，按 `order` 排序并生成导航、hash 路由、公开 JSON 和默认音阶映射。

```ts
interface SectionManifest {
  id: string;
  label: string;
  order: number;
  icon?: string;
  kind: "content" | "interactive";
  contentCollection?: string;
  renderer?: string;
  audioScale?: string;
  terminalCommands?: string[];
  visibility: "public" | "hidden";
}
```

- 增加普通板块：复制最小 manifest，新增 Markdown/YAML 内容，无需编辑 AppShell、TerminalMenu 或 router。
- 增加交互板块：新增独立 Astro component 和 manifest 的 `renderer`，通过公开 props/events 与页面壳通信。
- 模块可以声明自己的 terminal commands、音阶和可选 API adapter，但不得直接读取其他模块的内部文件。
- registry 对重复 ID、重复 order、缺失 renderer、未知音阶和非法 hash 在构建时失败。
- `MODULE_DEVELOPMENT.md` 提供一个 `Now`/状态板块示例，作为个人扩展和模板使用者的最小样板。

## Content Model

所有条目必须有稳定 `id`，文件名改变时不影响外部引用。`visibility` 只允许 `public` 或 `hidden`；私人笔记不属于该内容模型。

```ts
type SectionId =
  | "about"
  | "education"
  | "research"
  | "publications"
  | "life"
  | "playground";

interface PublicContentItem {
  id: string;
  section: SectionId;
  title: string;
  summary?: string;
  bodyHtml: string;
  links: { label: string; url: string }[];
  tags: string[];
  visibility: "public" | "hidden";
  updatedAt: string;
}

interface PublicationEntry {
  id: string;
  title: string;
  authors: string[];
  kind: "journal" | "conference" | "preprint" | "working-paper";
  status: "published" | "accepted" | "under-review" | "in-progress";
  venue?: string;
  year?: number;
  doi?: string;
  url?: string;
}
```

生产内容集合初始不放 Publications 条目。`tests/fixtures/publications.mock.ts` 提供多种状态、长标题和缺失 DOI 的测试数据。构建检查在 production 模式发现 `mock: true` 或测试 fixture 被导入时直接失败。

## Navigation and Rendering

- 首次加载渲染完整 HTML，但 CSS 在 JavaScript 可用时只显示当前板块。
- 默认板块为 `about`；URL 使用 `#about`、`#education` 等稳定 hash。
- 点击菜单更新 hash、板块、焦点和页面标题，不触发完整刷新。
- 数字键 `1` 至 `6` 切换板块；输入焦点位于 terminal 或表单时不截获这些键。
- `Escape` 将焦点返回主菜单；浏览器后退/前进监听 `hashchange`。
- 未知 hash 回退到 `about`，并保留可读错误提示供调试，不展示空白页面。
- 320 px 至宽屏均不依赖固定 ASCII 字符宽度维持布局。桌面显示完整 ASCII 框，窄屏改用 CSS 边框和等价文字结构。

## Audio Design

### Background Track

背景曲配置使用公开、可替换的 manifest：

```ts
interface BackgroundTrack {
  id: string;
  title: string;
  sourceUrl: string;
  sourceType: "local" | "licensed-external";
  attribution: string;
  licenseNote: string;
  loop: boolean;
}
```

目标曲目标记为 `lalaland-theme`，显示名先用 `La La Land Theme`，具体版本由所有者提供。发布方案按以下优先级处理：

1. 所有者提供有权公开托管的音频文件，放入 `public/audio/` 并填写来源与许可说明。
2. 使用允许网页播放的合法外部音源 URL，并保留原平台要求的署名或链接。
3. 在未取得合法音源时，production 不加载该商业曲目；开发和测试使用仓库内原创 placeholder 验证播放、循环、切换和错误处理。

播放器只维护一个背景音实例。页面切换不重启曲目；音量和静音偏好写入 `localStorage`，播放进度不跨会话保存。浏览器拒绝播放时回到 paused 状态并显示可操作提示。

### Random Guitar Notes

短音效采用自己录制或许可明确的干声吉他 one-shot samples。`GuitarNoteEngine` 在一次用户动作中选择一个音符，最多允许 3 个短音并发；超过上限时停止最早的声音。随机选择注入 RNG，测试时可固定序列。

| 板块 | 默认音阶 | 音符集合 |
| --- | --- | --- |
| About Me | C major | C D E F G A B |
| Education | G major | G A B C D E F# |
| Research | D Dorian | D E F G A B C |
| Publications | A minor pentatonic | A C D E G |
| Misc 01 / Life | E minor pentatonic | E G A B D |
| Misc 02 / Playground | E blues | E G A Bb B D |

每次点击优先排除上一次音符，再从当前集合中随机选择。音阶、音域、采样路径、增益和播放概率都放在 `src/config/audio.ts`，以后新增板块时可以直接映射新音阶。

## Playground Terminal

terminal 只接受经过 trim 和小写化的单行命令。命令表是显式映射，不调用 `eval`、shell 或任意网络地址。

| 命令 | 行为 |
| --- | --- |
| `help` | 列出可用命令 |
| `about` | 切换到 About Me |
| `books` | 显示已公开书单；无条目时显示诚实空态 |
| `guitar` | 播放当前音阶的一个随机吉他音并显示音名 |
| `fitness` | 触发简短像素动作和已公开兴趣文字 |
| `music` | 显示曲目信息并切换背景曲播放状态 |
| `clear` | 清空 terminal 输出 |

未知命令返回 `command not found` 和 `type help`，最长输入 80 个字符，历史记录最多保留 50 条。输出作为文本节点渲染，不解释用户输入中的 HTML。

## Public Content API

Astro 构建时生成：

`GET {base_url}/api/v1/content.json`

```json
{
  "schemaVersion": "1.0",
  "generatedAt": "2026-09-28T00:00:00Z",
  "revision": "{git_commit_sha}",
  "profile": {
    "displayName": "Manting Guo",
    "email": "kingsleyrex@sjtu.edu.cn"
  },
  "sections": [
    {
      "id": "about",
      "label": "About Me",
      "order": 1,
      "items": []
    }
  ]
}
```

- 这是静态公开文件，不支持写入。
- 页面和 JSON 使用同一份已校验内容，避免更新不同步。
- `revision` 来自 GitHub Actions 的 commit SHA；本地构建使用 `local`。
- schema 的破坏性变更发布到 `/api/v2/`；`v1` 内只允许新增可选字段。

## Future Assistant and Notes Contract

首版实现 `DisabledAssistantAdapter`。未配置 `PUBLIC_ASSISTANT_API_BASE` 时只显示 `[assistant: offline / not configured]`，不展示可输入但无实际服务的聊天框。

未来 VPS 服务实现 `HttpAssistantAdapter`。公开 adapter 提供 `health(signal)` 和 `queryPublic(input, signal)`；owner notes adapter 提供 `searchNotes(query, signal)`、`createNote(input, signal)`、`updateNote(id, input, signal)`、`archiveNote(id, signal)` 和 `summarizeNotes(ids, signal)`。所有异步方法返回有类型的 Promise，并接受可选 `AbortSignal` 以统一处理超时和页面卸载。

建议 HTTP 契约：

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/health` | public | 服务状态与能力版本 |
| `POST` | `/api/v1/public/query` | public + rate limit | 只基于公开主页内容回答 |
| `GET` | `/api/v1/notes?query=` | owner | 搜索私人笔记 |
| `POST` | `/api/v1/notes` | owner | 新建笔记 |
| `PATCH` | `/api/v1/notes/{id}` | owner | 修改笔记 |
| `POST` | `/api/v1/notes/{id}/archive` | owner | 归档笔记 |
| `POST` | `/api/v1/notes/summarize` | owner | 总结选定笔记 |

owner 接口使用 OIDC Authorization Code + PKCE 登录，返回短期 access token；token 只保存在内存中。长期密钥、模型密钥和笔记数据库都留在 VPS。网关限制 CORS 到正式站点域名，所有写操作校验 `owner` scope 并记录审计事件。公开 visitor 模式与 owner notes 模式使用不同路由、权限和界面状态。

## Data Flow

### Build and Publish

1. 所有者编辑 Markdown/YAML 并执行本地预览。
2. schema 校验内容、链接和 publication 状态；production 构建检查 mock 数据未被引入。
3. Astro 同时生成静态页面和 `/api/v1/content.json`。
4. push 到现有 `master` 后，GitHub Actions 安装锁定依赖、检查、构建并上传 Pages artifact。
5. GitHub Pages 原子切换到成功构建；失败时保留最近成功版本。

### Visitor Interaction

1. 浏览器先显示启动层，核心 HTML 已在文档中。
2. 访客选择带声音或静音进入。
3. 菜单切换 hash 和当前内容；带声音模式同时触发当前板块的随机吉他音。
4. 背景曲延后加载，由 AudioControls 管理唯一实例。
5. Playground terminal 在本地命令表中执行，无网络依赖。

### Future Notes Assistant

1. 页面读取 `/health` 判断网关可用性。
2. 访客只能访问 `public/query`；响应只允许引用公开 content JSON。
3. 所有者通过 PKCE 登录后进入 owner mode，获得短期 token。
4. 笔记 CRUD 请求发送给 VPS 网关；网关校验 scope 后访问私人存储。
5. API 超时、未授权或离线只影响助手区域，不影响主页内容与本地互动。

## GitHub Pages and VPS Deployment

### Existing Repository Replacement

目标仓库已经确认是 `kingsley-wade/kingsley-wade.github.io`，公开、HTTPS 已启用，当前 commit 为 `1ff74d9e`，默认分支为 `master`，Pages 状态为 built，发布方式是 `legacy`，来源为 `master:/`。现有内容是 `niklasbuschmann/contrast` Jekyll 主题，并带 Unlicense。

替换顺序：

1. 将远端仓库克隆到独立工作目录，确认 `1ff74d9e` 与远端 HEAD 一致。
2. 创建并推送 annotated tag `legacy-jekyll-2024`，记录旧站 URL、主题来源和恢复命令。
3. 在迁移分支移除旧 Jekyll 的 `_layouts`、`_includes`、`_sass`、示例 `_posts`、Gemfile 和 vendored KaTeX/Font Awesome；不删除 `.git` 历史。
4. 写入已验证的 Astro 站点和 workflow，经本地 production build 与预览检查后合并到 `master`。
5. 将 Pages Source 从 legacy branch build 切换为 GitHub Actions；workflow 仅授予 `contents: read`、`pages: write`、`id-token: write`。
6. 验证 `https://kingsley-wade.github.io/`、公开 JSON、资源路径和 commit revision。若失败，将 Pages Source 恢复为 `master:/` 并回退到恢复 tag 对应提交。

保留 `master` 是有意的迁移控制：首次发布只替换构建系统和页面，不同时重命名默认分支。稳定后是否改为 `main` 作为独立维护任务处理。

`astro.config.mjs` 默认配置 `site: "https://kingsley-wade.github.io"`、`base: "/"`，同时允许 `SITE_URL` 和 `BASE_URL` 覆盖，以便模板仓库、项目 Pages 和 VPS 使用。所有内部链接使用 base-aware URL helper，不写死根路径。

### Reusable Template Repository

个人站验收后创建独立公开仓库 `kingsley-wade/pixel-terminal-homepage`，并在 GitHub 设置中启用 Template repository。它不是个人站仓库的自动镜像，而是经过边界检查的可发布模板：

- 保留 core components、module contract、主题 presets、音频控制器、公开内容 API、测试和部署 workflow。
- 将个人 content 替换为中性示例；将像素头像替换为许可明确的 placeholder；将背景音乐替换为原创 mock。
- `src/config/site.ts`、`src/config/theme.ts` 和 `.env.example` 是主要定制入口。
- README 提供 `Use this template`、本地启动、GitHub Pages 根路径/子路径部署和新增模块步骤。
- 使用 MIT 许可证；第三方资源保留各自声明。
- 个人仓库 `TEMPLATE_UPSTREAM.md` 记录模板仓库 URL、模板版本和同步步骤。首版采用 upstream remote + changelog 手动同步，不引入 npm 包发布流程。

`scripts/create-template-snapshot.mjs` 将通用代码复制到临时输出目录，再用 `template-seed/` 中的中性配置、内容和媒体覆盖个人文件。`scripts/verify-template-boundary.mjs` 随后扫描候选树，若发现个人姓名、公开邮箱、个人照片文件名、CV 路径、受限曲目标识或私人 API 地址则失败。模板验收必须从该快照新建临时仓库，修改 identity、切换主题 preset、增加一个示例板块并完成 build。

### VPS Migration

- 执行同一个 `pnpm build` 生成 `dist/`。
- Nginx/Caddy 将 `dist/` 作为静态目录，并为 `/api/` 反向代理到助手网关。
- `PUBLIC_ASSISTANT_API_BASE` 从外部 API URL 改为同源 `/api` 即可。
- 内容 schema、页面 URL、音频配置和组件不变。

## Error Handling

| Expected failure | Handling | User-visible result |
| --- | --- | --- |
| 内容 schema 无效 | 构建失败并指出文件和字段 | 旧线上版本继续可用 |
| section manifest 重复或缺字段 | registry 校验失败并列出模块路径 | 不发布不完整导航 |
| theme token 缺失或文字对比度不足 | 配置/可访问性检查失败 | 不发布难读主题 |
| Publications 为空 | 构建正常 | `Publications are being prepared.` 空态 |
| mock publication 进入 production | 构建检查失败 | 不发布虚假内容 |
| hash 不存在 | 回退 `#about` | About Me 正常显示 |
| JavaScript 加载失败 | 不隐藏静态正文 | 六板块顺序可读，无互动 |
| 音频被浏览器拦截 | 捕获 rejected promise，状态回到 paused | 显示 `Tap to enable sound` |
| 背景曲 URL 失败 | 停止重试并保留静音/更换曲目操作 | 页面与吉他音效继续工作 |
| 吉他 sample 缺失 | 降级到短促 Web Audio 合成拨弦音或静音 | 导航仍完成，状态区说明音效不可用 |
| 助手未配置 | 使用 disabled adapter | 只显示未配置状态 |
| 助手超时 | 8 秒 abort，允许重试 | 当前页面不受影响 |
| owner token 失效 | 清除内存 token，要求重新登录 | 不执行笔记写入 |
| GitHub Actions 构建失败 | 不部署 artifact | Actions 显示失败日志，线上保持旧版 |
| Pages 切换到 Actions 后首次部署失败 | 按迁移手册恢复 legacy source 或恢复 tag | 旧 Jekyll 页面可恢复 |
| 模板候选包含个人标识或受限资源 | template boundary 检查失败 | 不创建或更新模板 release |

## Testing Strategy

### Unit Tests

- 内容 schema：必填字段、非法 URL、publication 状态和生产 mock 拦截。
- section registry：自动发现、排序、重复 ID/order、缺失 renderer 和新增普通板块。
- theme config：必需 token、preset override 和允许的颜色格式。
- `GuitarNoteEngine`：音阶范围、避免连续重复、固定 RNG、并发上限和缺失 sample 降级。
- terminal parser：白名单、大小写、长度限制、HTML 字符和未知命令。
- assistant adapter：disabled 状态、成功响应、401、超时和无效 JSON。

### Integration and End-to-End Tests

- Astro production build 在根路径和 `/personal-homepage/` base 下均成功。
- Playwright 覆盖启动层、带声音/静音进入、六个菜单、hash、后退/前进、键盘导航和 terminal。
- 音频测试 mock `HTMLMediaElement.play` 与 AudioContext，验证只有一个背景实例、音量持久化和连续点击限流。
- Publications 使用测试 fixture 覆盖长标题、无 DOI、不同状态；production 页面验证不存在 mock 标记。
- 静态 JSON 与页面内容 ID、更新时间和 revision 一致。
- 从中性模板 fixture 修改 identity、主题和新板块后完成 build，且不需要改 AppShell、TerminalMenu 或 router。
- template boundary 扫描能够拦截姓名、邮箱、CV、个人头像和受限音轨。

### Accessibility and Visual Checks

- 使用 axe 检查主页面、展开内容和 Playground 状态。
- Playwright 截图覆盖 1440×900、768×1024、390×844 和 320×568。
- 检查键盘焦点、减少动画、200% 缩放、无横向溢出和文字不遮挡。
- 对 `pastel-sky` 的浅蓝画布、各辅助面和深色文字运行 WCAG AA 对比度检查；检查页面不会因浅蓝主色变成单一蓝色层次。
- 与参考站对照启动层、身份框、菜单、配色和声音触发；个人化差异记录在 `REFERENCE_COMPARISON.md`。

### Deployment Smoke Check

- 替换前验证并推送 `legacy-jekyll-2024` 恢复 tag；首次真实发布记录 commit SHA、Actions 完成时间和线上可见时间。
- 验证首页、头像、字体、吉他样本、背景曲配置、hash 直达和 `/api/v1/content.json`。
- 修改一处公开文案再次 push，确认五分钟工程目标和线上 revision 更新。

## Migration and Compatibility

本地工作区没有应用代码，但远端已有正在发布的 Jekyll 站点，因此这是一次构建系统替换。迁移保留 Git 历史和恢复 tag，删除的是旧主题工作树文件；旧提交仍可查看和恢复。个人 `_config.yml` 中的名称会迁入 `site.ts`，旧主题示例文章、作者邮箱和主题链接不迁入新站。

根路径、项目子路径与 VPS 通过 `site/base` 配置兼容。公开内容 API 从 `/api/v1/` 开始版本化。浏览器目标为当前稳定版 Safari、Chrome、Edge 和 Firefox；不支持 Web Audio 时保留全部页面功能并关闭声音互动。模板仓库与个人仓库共享相同目录契约，但不要求 commit history 相同。

## Risks and Tradeoffs

| Risk or Tradeoff | Impact | Mitigation |
| --- | --- | --- |
| 《爱乐之城》原曲版权 | 公开仓库或自托管可能缺少再分发权 | 音源与播放器解耦；只有获得合法来源后才进入 production，测试使用原创 placeholder |
| 直接替换正在发布的旧主题 | 错误 Pages 设置可能让主页短暂不可用 | 恢复 tag、迁移分支、本地预览、Actions 成功后切换 source，并记录回滚步骤 |
| 粉彩颜色对比度不足 | 文字和焦点状态难以辨认 | 浅色只作表面；深蓝灰承载文字；自动与人工对比度检查 |
| 像素字体用于长文难读 | 阅读速度和移动端体验下降 | 像素字体只用于标题/导航，正文用等宽字体 |
| ASCII 框在窄屏溢出 | 手机出现横向滚动 | 桌面保留 ASCII，窄屏使用等价 CSS terminal 框 |
| 随机吉他音频过于频繁 | 连续导航可能产生噪音或重叠 | 声音需主动开启；限制并发、增益和触发频率；允许立即静音 |
| Astro 增加构建工具 | 比单文件 HTML 多一层依赖 | 换取内容 schema、模块扩展和可靠 Pages/VPS 构建；锁定依赖并输出纯静态 `dist/` |
| 模块接口设计过度 | 简单个人页维护成本增加 | 只抽象 section manifest、renderer、音阶和命令四个实际扩展点；首版不做插件市场或动态加载 |
| 个人站和模板仓库产生漂移 | 修复可能只进入一边 | 记录模板版本、upstream remote 和 changelog；稳定后再评估是否提取 npm core package |
| 公共主页与私人笔记混在一个 UI | 可能误暴露私人数据 | 使用独立 adapter、owner scope 和 VPS 存储；首版不实现私人笔记后端 |
| 第三方 AI 或音频服务离线 | 互动局部不可用 | 核心内容静态化，网络功能独立降级 |

## Approval

- Design approved by user: `yes — 2026-09-28`

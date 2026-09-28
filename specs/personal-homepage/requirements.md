# Requirements

## Spec Metadata

- Feature: `personal-homepage`
- Owner: `Manting Guo（取自本地 CV，公开显示名待确认）`
- Status: `approved`
- Last updated: `2026-09-28`

## Purpose

建立一个可通过 GitHub Pages 发布的个人主页，尽可能参考[指定教授主页](https://sites.pitt.edu/~kpele/)的信息架构、个人学术主页气质、像素/terminal 视觉和“点击页面元素产生声音或背景音”的趣味交互，同时以浅蓝背景和多种浅色调形成独立的个人风格。主页应以静态内容为第一版基础，并预留可迁移到 VPS、接入个人 AI 助手和增加新板块的边界。个人版本部署稳定后，还应整理出不含个人资料和受限媒体的独立 GitHub Template 项目，供其他人按自己的内容、配色、模块和声音偏好复用。

这里的“参考教授主页”指参考其页面组织方式、排版密度、导航感和交互气质，不表示主页所有者自称教授。当前身份应以个人学习者、研究参与者和兴趣创作者的真实资料来编排。

**最高优先级的视觉要求：尽可能参考 https://sites.pitt.edu/~kpele/ 的实际主页体验。该地址是主要对照对象，不得只提取“像素 + terminal”关键词后做成通用个人网站。** 保留其布局、导航、文字节奏、像素元素和交互方式；配色改为浅蓝底色配合冰白、薄荷绿、淡紫和柔和珊瑚色，正文使用深蓝灰保证可读性。《爱乐之城》和《Normal People》不只是兴趣列表条目，也是按钮触发背景音、音乐氛围和互动彩蛋的主题来源。

### 当前工作区与参考证据

- 已阅读现有需求草稿及 `cvfor_applied_math/` 下的姓名、教育、研究、技能、奖项与出版资料；当前无应用代码、包管理配置、构建/测试命令，也未初始化 Git。
- 已查看根目录 `1.jpg`（白色上衣、深色衣领）和 `idphoto.jpg`（棕色上衣）两张正面照片。两张共同作为个人像素头像的外观依据；它们是照片原稿，并非已经制作好的像素头像。
- 2026-09-28 已通过远程页面读取与 Internet Archive 的 2026-04-16 原始 HTML 核实教授主页。直接访问失败的原因是 Clash `MATCH` 规则将 `sites.pitt.edu` 交给当前新加坡节点后，目标连接在 TLS 握手阶段断开；这不影响使用远程抓取结果作为需求证据。
- 已核实的参考特征包括：全屏黑色 `INSERT COIN` 启动画面、闪烁提示、`Press Start 2P` 像素字体、黑底荧光绿正文、青色菜单、黄色标题、橙色提示、绿色描边的约 200 px 像素头像、DOS/ASCII 边框信息框、带 `[1]` 至 `[7]` 编号的单屏菜单、点击后一次只展示一个正文板块，以及录像带/文件夹/书本等 emoji 标题。
- 已核实的声音行为是：按 Enter 或点击 `TAP TO START` 后播放 `coin.mp3`，点击任一菜单项后播放 `click.mp3`。原始 HTML 未发现持续背景音乐、曲目切换、暂停、静音或音量控制。因此“持续背景音乐及影视/吉他氛围”属于本站在参考交互之上增加的个人化功能，不能表述为原站已有能力。

### 建议目录约定

沿用 `specs/personal-homepage/`；后续建议将页面与模块放在 `src/`，公开文字与结构化数据放在 `content/`，确认可发布的头像衍生图和音频放在 `public/`，发布流程放在 `.github/workflows/`，说明和参考对照记录放在 `docs/`，验证文件放在 `tests/`。`cvfor_applied_math/` 和根目录照片继续作为输入资料，不整目录复制进公开构建产物。具体框架和文件映射在需求批准后的设计阶段确定。

## Scope

### In Scope

- GitHub Pages 可部署的静态个人主页，使用 Git 推送到发布分支触发自动发布。
- 直接复用现有公开仓库 `kingsley-wade/kingsley-wade.github.io` 和根域名 Pages 地址，替换旧 Jekyll 主题并保留 Git 历史与可恢复锚点。
- 顶部或侧边主导航：`About Me`、`Education`、`Research`、`Publications`、`Misc 01`、`Misc 02`。
- 按指定教授主页进行视觉与交互对照，保留个人学术主页的信息密度；名称、头像和学术内容使用所有者自己的资料。
- `Misc 01` 默认承载生活兴趣：健身、阅读、吉他，以及电影《爱乐之城》和电视剧《Normal People》等可扩展内容。
- `Misc 02` 默认承载互动与动态：访客可触发的 terminal 小互动、状态/日志，以及未来以个人笔记管理为主要用途的 AI 助手入口。
- 使用仓库中的 `1.jpg`、`idphoto.jpg` 共同作为原创像素头像的参考素材；最终发布优化后的像素肖像衍生资源。
- 以 `cvfor_applied_math/education.tex`、`employment.tex`、`skills.tex`、`misc.tex`、`cv-llt.tex` 中经过所有者确认的内容作为教育、研究、技能、兴趣和联系方式的候选资料来源。
- 将 `cvfor_applied_math/own-bib.bib` 视为待审核输入；模板示例、虚构条目或与所有者无关的作者记录不得进入公开 `Publications`。
- 可配置的内容数据层，使新增栏目、条目和页面无需重写核心布局。
- 可配置的主题 token、板块定义和扩展接口，使所有者可以增加常规内容板块，也可以添加带自定义交互的新功能模块。
- 个人站稳定后产出独立的通用模板仓库；模板不得包含个人 CV、邮箱、头像、论文、私人笔记配置或《爱乐之城》商业音轨。
- 为未来后端预留 HTTP API / adapter 边界；GitHub Pages 版本在没有后端时仍能正常浏览，并对不可用接口降级。
- 基础无障碍、移动端响应式、键盘可操作、以指定参考站为结构依据的像素/终端视觉主题，并提供清晰的音频控制；个人 preset 明确使用浅蓝粉彩配色，参考站的深色配色仅作为模板中的可选示例。
- 支持由所有者提供或确认授权的背景音乐/环境音；按钮、导航或 terminal 命令可触发短音效或启动背景音，但音频不是访问主要内容的前置条件。

### Out of Scope

- 第一版不声称用户是教授、研究员或其他未确认的职业身份。
- 第一版不捏造教育经历、研究项目、论文、期刊、DOI、奖项或联系方式；缺失信息使用可编辑占位或隐藏。
- 第一版不实现需要数据库、用户账户、私密聊天记录或服务端持久化的 AI 助手。
- 不承诺 GitHub Pages 能直接驱动本地软件、读取访客本地文件或执行任意远程命令。
- 不在未确认授权的情况下把商业电影、电视剧或音乐的受版权保护音轨提交到公开仓库；《爱乐之城》主题曲通过所有者提供的合法音源或合法流媒体入口接入，开发和自动测试使用明确标记的替代音频。
- 不在本阶段建设完整 CMS、评论系统、在线商城或复杂后台管理端。

## Users and Goals

- 作为主页所有者，我想通过 Git 提交更新主页内容，使公开页面在 GitHub Actions 发布后自动同步。
- 作为主页所有者，我想增加新的兴趣、项目或资料板块，而不必重写现有页面结构。
- 作为主页所有者，我想未来将同一套前端迁移到 VPS，并接入个人 AI 助手或其他 API。
- 作为主页所有者，我想通过明确的模块接口增加板块和功能，而不需要修改页面壳、导航器、音频控制器和部署流程。
- 作为模板使用者，我想通过修改少量配置、内容文件、主题色和媒体资源生成自己的主页，并能按相同模块接口继续开发。
- 作为访客，我想快速了解主页所有者的背景、教育、研究兴趣与公开作品，并通过清晰导航访问不同板块。
- 作为访客，我想在页面中发现轻量、有边界且可跳过的 terminal 风格互动。
- 作为访客，我想通过点击导航或互动元素体验与页面氛围一致的背景音/短音效，同时可以随时暂停或静音。

## Functional Requirements

### R1 — 参考站相似度与个人化

- WHEN 进入设计阶段，THE SYSTEM SHALL 以指定教授主页为主要视觉依据，形成首屏、导航、内容面板、头像、terminal、声音入口的逐项对照记录；每项记录原站观察、本站保留点、个人化替换及差异原因，并以已保存的 2026-04-16 原始 HTML 证据补足当前节点无法直连的限制。
- WHEN 呈现首屏，THE SYSTEM SHALL 保留参考站的街机式进入仪式：浅蓝全屏启动层、醒目的 `INSERT COIN` 风格文案、闪烁提示、Enter 键和触屏按钮两种进入方式；文案、代号和身份行须替换成所有者自己的内容。
- WHEN 呈现主界面，THE SYSTEM SHALL 延续参考站的像素字体、ASCII 信息框、编号导航和单板块展开方式，同时使用浅蓝背景、冰白内容面、薄荷绿/淡紫辅助面、柔和珊瑚强调和深蓝灰正文；移动端可重排 ASCII 结构但须保留同一视觉语言。
- WHEN 使用浅色主题，THE SYSTEM SHALL 将浅色用于背景和装饰面，将达到 WCAG AA 对比度的深色用于正文、链接和关键控件状态；不得因追求粉彩效果降低主要文字可读性。
- WHEN 交付界面验收，THE SYSTEM SHALL 提供桌面与移动端页面截图，并逐项演示导航、terminal 和音频行为；“符合参考风格”须由所有者对照确认，不能只凭存在像素字体或深色背景判定通过。
- WHEN 展示个人头像，THE SYSTEM SHALL 使用基于两张参考照片制作的原创像素肖像，保留短黑发、面部轮廓等可辨认特征；最终发型、表情、服饰与配色在头像预览时确认。简单缩小原照片不视为已完成像素肖像。
- WHEN 展示个人兴趣，THE SYSTEM SHALL 以健身、阅读、吉他为主要内容，并在交互/声音主题中体现《La La Land》和《Normal People》的偏好；背景音乐目标曲目为《爱乐之城》主题曲，曲目文件须通过合法来源提供。

### R2 — 六个主板块与内容来源

主导航顺序固定为 `About Me → Education → Research → Publications → Misc 01 → Misc 02`；前四项保留所有者要求的学术结构。两个 Misc 可以拥有解释性副标题，后续可重命名。

| 板块 | 首版内容与候选来源 | 编辑边界 |
| --- | --- | --- |
| About Me | CV 姓名 Manting Guo；应用数学背景；AI-agent workflows 的优化与基础设施研究兴趣；公开邮箱 `kingsleyrex@sjtu.edu.cn` | 不从目录名猜测中文姓名或学位类型；当前身份文案在发布前确认 |
| Education | 2024–Present 上海交通大学应用数学研究生项目，CV 注记自 2025-09 起与 SLAI 联合培养；2020–2024 上海交通大学应用数学本科 | 保留 CV 原始措辞，不推断硕士/博士，不自行展开 SLAI；GPA、中学经历默认省略，可配置开启 |
| Research | Arranged Forests（2021–2022）；反应扩散系统建模与数值分析（2023–2024）；跨尺度系统标度律（2024）；Agent Serving Scheduling / AI for Mathematics（2025–Present） | 从 `employment.tex` 提取；按项目介绍问题、本人贡献、年份和已有链接，不放大结论 |
| Publications | 首版建立可维护的出版物数据结构和完整展示能力；正式条目由所有者后续填入 | 开发与测试可使用显眼标记的 mock 条目；生产构建不得把 mock 内容呈现为真实成果；已发表与工作论文分组 |
| Misc 01 — Life | 健身/力量训练、阅读、指弹吉他；可扩展书单、练习记录和短文 | 不虚构训练成绩、读过的书或录音；未提供内容用简短空态 |
| Misc 02 — Playground | 可点击的 terminal 命令、像素头像回应、音乐与影视主题彩蛋、未来助手入口 | 首版互动在浏览器本地完成，不把本地计数包装成全站访客统计 |

候选事实来自本地 CV，不表示已经对外核实其当前状态。`own-bib.bib` 包含 Sample Paper、A Fictional Research 等模板及他人论文；`cv-llt.tex` 的 publications 引入还处于注释状态，不能以 `nocite{*}` 批量生成个人论文列表。简历中的邮箱、时间与论文状态须集中记录来源和待确认项，避免要求所有者重填已能从 CV 提取的资料。

### R3 — 导航、扩展与静态浏览

- WHEN 访客打开主页，THE SYSTEM SHALL 在首屏展示个人名称/称呼、像素头像或头像占位、简短自我介绍、当前状态和主导航。
- WHEN 访客选择主导航项，THE SYSTEM SHALL 在不丢失全局导航的情况下展示对应的 `About Me`、`Education`、`Research`、`Publications`、`Misc 01` 或 `Misc 02` 内容。
- WHEN 某个板块没有真实内容，THE SYSTEM SHALL 显示诚实的“内容准备中/暂未公开”状态或隐藏该条目，不得生成虚构履历。
- WHEN `Publications` 尚无正式条目，THE SYSTEM SHALL 在生产页面显示简短空态；WHEN 运行开发、组件预览或自动测试，THE SYSTEM SHALL 可加载独立的 mock fixtures 验证期刊、工作论文和外链展示，且 mock 数据不得进入生产内容源。
- WHEN 所有者向内容数据中增加一个合法栏目或条目，THE SYSTEM SHALL 允许前端按统一 schema 渲染该内容，而不需要修改每个既有页面的布局逻辑。
- WHEN 代码推送到配置的 GitHub 发布分支，THE SYSTEM SHALL 自动通过 GitHub Actions 构建并发布到 GitHub Pages，无需另行手动上传文件；仅本地保存或 commit 不触发线上更新。
- WHEN 发布完成，THE SYSTEM SHALL 允许用构建版本/commit 标识确认线上版本；正常情况下以推送后 5 分钟内可见为工程目标，并记录一次真实推送到线上可见的耗时。GitHub 排队、服务故障和缓存可能延长时延，不承诺秒级或严格即时发布。
- IF 构建或内容校验失败，THEN THE SYSTEM SHALL 保留最近成功发布版本，并提供失败步骤与日志入口；文档须说明通过 revert 后重新推送恢复旧内容的方法。
- WHEN 站点部署于用户名 Pages 根路径、仓库 Pages 子路径或 VPS，THE SYSTEM SHALL 通过部署配置适配资源和链接路径；导航直达、刷新以及图片/音频加载均正常，迁移不要求改写内容与交互模块。
- WHEN 所有者添加一个使用既有内容类型的新栏目，THE SYSTEM SHALL 通过新增内容与导航配置呈现它；全新互动类型允许增加独立组件，不要求修改既有六个板块的内部实现。
- WHEN 所有者添加常规内容板块，THE SYSTEM SHALL 只要求新增内容文件和 section manifest；WHEN 添加自定义功能板块，THE SYSTEM SHALL 允许通过稳定的 module contract 注册组件、命令、音阶和可选 API adapter，不修改页面壳与已有模块。

### R4 — 个人 AI 助手接入边界

- WHEN 个人 AI 助手需要读取公开主页资料，THE SYSTEM SHALL 提供与页面同源生成的版本化静态 JSON，包含稳定内容 ID、板块、公开正文/摘要、链接、更新时间和 schema 版本；一次内容更新须同步影响页面与机器可读输出。
- WHEN 后续接入外部助手服务，THE SYSTEM SHALL 通过可配置服务地址与独立 adapter 接入；设计文档须明确健康状态、问答请求/响应、超时和错误格式，静态 JSON 读取接口与动态问答接口分别定义。
- WHEN 设计未来 AI 助手接口，THE SYSTEM SHALL 优先支持个人笔记的检索、创建、更新、归档和摘要，并将这些私有操作与访客可访问的公开主页问答明确分离。
- IF AI 助手访问私人笔记，THEN THE SYSTEM SHALL 要求所有者身份认证和短期授权；浏览器静态资源、公开 JSON、仓库内容和访客 terminal 均不得包含私人笔记或长期凭证。
- IF 未配置后端，THEN THE SYSTEM SHALL 不发送问答请求、不显示可用的假聊天框，并清楚说明助手尚未接入；terminal 本地反馈不得冒充 AI 回答。
- IF 后续助手需要修改主页内容，THEN THE SYSTEM SHALL 通过受认证的维护端或仓库提交工作流写入、再触发部署；公共访客界面不获得仓库写权限。首版交付接入文档，不实现写入服务。
- WHEN 页面运行在纯静态 GitHub Pages 环境且 AI/API 后端不可用，THE SYSTEM SHALL 保持主页和本地互动可用，并展示明确的离线/暂不可用状态。
- WHEN 配置了兼容的后端 API，THE SYSTEM SHALL 通过版本化 adapter 调用健康检查和未来 AI 助手接口，不将密钥写入前端源码或静态资源。
- WHEN 访客触发 terminal 小互动，THE SYSTEM SHALL 提供可重复、可退出、不会修改访客本地系统的反馈；互动失败时不影响主要内容浏览。

### R5 — 趣味互动、背景音乐与按钮声音

- WHEN 访客打开 Playground，THE SYSTEM SHALL 提供可点击的命令示例和等价键盘输入，至少包括 `help`、`about`、`books`、`guitar`、`fitness`、`music`、`clear`；命令仅映射到公开内容、预设互动与音频控制，不执行系统 shell。
- WHEN 访客触发吉他/健身/阅读相关彩蛋，THE SYSTEM SHALL 给出与本人兴趣对应的短动画、文字或声音反馈，例如头像拨弦、运动动作、书页切换；至少完成两种，无内容时不生成个人经历。
- WHEN 访客按 Enter 或点击 `START WITH SOUND` 进入主页，THE SYSTEM SHALL 将该手势视为启用声音，播放一段原创或许可明确的入场音效，对应参考站的 `coin.mp3` 行为，并初始化后续背景音频。
- WHEN 访客首次进入页面，THE SYSTEM SHALL 同时提供清晰的静音进入方式；在访客主动选择带声音进入前，声音默认关闭。已记住开启偏好时仍须遵守浏览器用户手势限制，不保证刷新后自动播放。
- WHEN 声音已开启且访客点击导航或带声音的按钮，THE SYSTEM SHALL 产生简短操作音效；背景音乐作为独立音轨持续播放，不因每次导航点击从头开始，也不叠加多个实例。
- WHEN 声音已开启且访客点击带音效的导航或按钮，THE SYSTEM SHALL 从当前配置的吉他音阶音符中随机选择一个拨弦音；不同栏目可映射不同音阶，连续点击不得无限叠加音频，也应尽量避免连续重复同一音符。
- WHEN 访客点击 `music` 或相应主题入口，THE SYSTEM SHALL 能播放/切换背景音乐或环境音；仅有按钮 beep 而无背景音体验不满足本需求。首版须至少提供一段可用的原创或许可明确的背景音。
- WHEN 展示音乐主题，THE SYSTEM SHALL 以《爱乐之城》主题曲作为首选背景曲目，并允许配置个人吉他氛围与《Normal People》相关的安静亲密氛围；曲目元数据和资源地址必须可替换，未取得合法音源时使用不复制原旋律的 mock 音频验证功能。
- IF 尚未提供影视原声的使用许可或自有音源，THEN THE SYSTEM SHALL 使用不复制现有旋律的原创声音并标明来源，保留替换音频文件与动作映射的配置入口；不得据此取消整个声音功能。
- WHEN 音频正在播放，THE SYSTEM SHALL 提供可见且可键盘操作的播放/暂停、静音和音量控制，并在移动端保持不遮挡主要导航。
- IF 浏览器阻止自动播放、音频资源加载失败或访客关闭音频，THEN THE SYSTEM SHALL 显示静音/不可用状态而不阻塞内容、导航或其他互动。
- WHEN 访客使用移动端或键盘操作，THE SYSTEM SHALL 保持内容可读、焦点可见、导航可达和布局不溢出。
- WHEN 使用头像素材时，THE SYSTEM SHALL 仅加载仓库中明确纳入发布的衍生资源或经所有者确认的原图，并避免暴露未需要的原始照片元数据。

### R6 — 可复用模板项目

- WHEN 个人主页通过部署验收，THE SYSTEM SHALL 能生成或整理一个独立的通用模板仓库，建议名称为 `pixel-terminal-homepage`，并将其设置为 GitHub Template repository。
- WHEN 其他人从模板创建仓库，THE SYSTEM SHALL 提供一个集中式 site config 和 theme config，使其无需搜索组件源码即可修改姓名、简介、导航、配色、头像、社交链接、声音开关和部署路径。
- WHEN 模板使用者只需要普通内容板块，THE SYSTEM SHALL 通过 Markdown/YAML 与 section manifest 完成扩展；WHEN 需要复杂互动，THE SYSTEM SHALL 提供最小示例模块和 module contract 文档。
- WHEN 生成模板版本，THE SYSTEM SHALL 用中性示例内容和可再分发 placeholder 媒体替换个人数据，保留许可证、快速开始、内容编辑、模块开发、GitHub Pages 和 VPS 部署说明。
- IF 个人仓库与模板仓库继续分别演进，THEN THE SYSTEM SHALL 在个人仓库记录模板来源和模板版本，并提供基于 upstream remote 或变更日志的手动同步流程。

## Non-Functional Requirements

- Performance: 首屏必要传输资源以压缩后不超过 1 MB 为初始预算（不含按需音频）；核心学术文本无需等待音频或助手服务。非必要动画和音频延后加载。
- Performance: 音频资源应按需加载或使用受控体积的压缩格式；音频加载不应阻塞首屏文字、导航和头像渲染。
- Reliability: 发布流程可重复；内容构建失败应阻止错误版本发布；前端 API 失败应优雅降级。
- Security or privacy: 浏览器端只使用公开配置；即便密钥来自 GitHub Actions secrets，也不得被静态构建内联进 JS/JSON。AI 服务密钥保留在未来服务端；只发布允许公开的内容与衍生媒体，公开 Git 仓库前也须检查源资料，不能仅依赖构建目录过滤。
- Usability: 页面延续像素/terminal 风格与浅色粉彩主题，同时优先保证信息层次、可读性、移动端和键盘可用性；互动不是阅读内容的前置门槛。
- Audio usability: 默认遵守浏览器自动播放策略；提供持久的静音偏好，避免访客每次切换栏目都被迫播放声音。
- Compatibility: 支持现代桌面和移动浏览器；首版适配 GitHub Pages 的静态托管路径，并为自定义域名和 VPS 反向代理保留配置入口。
- Maintainability: 内容、组件、主题和 API adapter 分层；新增栏目应以配置/数据和独立模块为主，避免单一巨型页面文件。
- Accessibility: 320 px 宽度下主要内容无横向溢出；键盘可操作全部导航和声音控制；尊重 `prefers-reduced-motion`；正文对比度以 WCAG AA 为目标，长段落不强制使用难读的像素字体。
- Progressive enhancement: JavaScript 或音频初始化失败时，About Me、Education、Research、Publications 等主要文本和链接仍可阅读；关闭动画和声音不损失信息。

## Constraints

- Repository constraints: 当前工作区包含两张根目录照片、`cvfor_applied_math/` 与 spec 文档；远端目标仓库为公开的 `kingsley-wade/kingsley-wade.github.io`，默认分支 `master`，当前通过 legacy Jekyll 从仓库根目录发布。远端旧主题有既有 Git 历史，替换前必须创建可恢复 tag 或归档分支。
- Platform constraints: GitHub Pages 只能托管静态前端；动态数据和 AI 调用必须通过公开安全的外部后端或未来 VPS 服务提供。
- Dependency constraints: 优先选择成熟、轻量、可在 GitHub Actions 构建的前端工具链；不要引入运行时必须付费或强绑定单一云厂商的能力。
- Content constraints: 使用上述 CV 候选资料建立内容清单；正式 Publications 由所有者后续填写，缺失内容不虚构补齐，mock fixtures 仅用于开发与测试。
- Media constraints: 背景音乐和音效必须来自所有者提供、授权或可合法再分发的资源；第三方作品只作为引用、链接或未嵌入的内容记录。

## Assumptions

- 初始部署目标为现有 `kingsley-wade/kingsley-wade.github.io`，实施时将工作区与该远端安全关联并新增 Pages workflow。
- 第一版采用单页或轻量多页体验均可，但 URL、导航和内容模块必须支持未来扩展。
- `Misc 01`、`Misc 02` 是可重命名的导航槽位，不是永久固定名称。
- 首版正文暂以英文为主、维护文档使用中文，与现有英文 CV 衔接；多语言切换不纳入首版必需范围。
- `cvfor_applied_math` 中的个人资料会在实现阶段转换成站点内容数据；发布前由所有者确认每一条教育、研究、出版和联系方式信息。
- 互动以客户端安全效果为主；AI 助手首版只定义接入契约，不在本阶段假定具体模型供应商，未来主要服务所有者的个人笔记管理。
- 声音默认关闭但提供显眼的开启入口；按钮短音效和可播放背景音均属于首版验收范围。具体实现可在设计阶段比较媒体文件与 Web Audio 原创声音的成本。

### 技术路线候选（供后续设计选择）

| 路线 | 对当前目标的影响 |
| --- | --- |
| 静态生成 + 少量客户端互动（建议） | 内容可直接阅读，Pages 成本低，接口和像素互动可独立扩展，构建产物可直接迁移 VPS |
| 完整客户端 SPA | 复杂互动方便，但须额外处理首屏内容、无 JS 降级和 Pages 路由刷新 |
| 从首版引入服务端应用 | 动态能力强，但 Pages 无法承载服务器，需要额外托管，不符合目前优先需求 |

此处只确定静态优先的需求方向，不预先锁定框架或 AI 供应商。

## Resolved Decisions and Deferred Inputs

- 公开邮箱确认为 `kingsleyrex@sjtu.edu.cn`；首屏暂采用 CV 中的 Manting Guo，当前身份文案在发布前复核。
- Publications 的正式内容由所有者后续填写；开发和测试先用隔离的 mock fixtures 验证功能，生产页面为空时显示诚实空态。
- GitHub 个人部署目标确认为现有 `kingsley-wade/kingsley-wade.github.io`；保留仓库和 URL，归档旧 Jekyll 版本后用新 Astro 站点替换。现有 `master` 作为首次迁移发布分支，避免同时更换主题、分支和 Pages 地址；稳定后可另行改名为 `main`。
- 未来 AI 助手以个人笔记管理为主要能力；公开主页只预留安全 adapter 和状态入口，私人笔记写操作留给未来受认证服务。
- 背景音乐目标为《爱乐之城》主题曲；实际发布需由所有者提供合法音源或选择合法流媒体入口，开发阶段使用可替换 mock 音频。
- 按钮音效采用吉他拨弦样本，并按照不同栏目映射的音阶随机取音；具体音阶表在设计文档中定义。
- 两个 Misc 暂保持原名并使用 Life / Playground 副标题，正文暂为英文。
- 像素头像以两张照片共同参考，主姿态、上衣和表情在设计预览时选择；默认仅发布头像衍生图。
- 参考站的 HTML、CSS 和声音触发逻辑已经核实；实现阶段仍需通过页面截图与实际交互对照确认最终相似度。
- 个人站使用浅蓝粉彩主题；通用模板提供可替换 theme tokens 和至少一个额外示例 preset。
- 个人站部署通过后建立独立 `pixel-terminal-homepage` 模板仓库；模板采用适合复用的开源许可证，个人内容和受限音频不进入模板。

## Acceptance Review

- 参考站：有明确的逐项对照记录和实际界面对照；所有者确认相似度及个人化差异。
- 内容：六板块齐备，CV 来源可追溯，模板论文未发布，工作论文没有冒充已发表成果。
- 声音：开启后点击按钮有反馈，背景音可播放与切换，静音/暂停/音量有效；刷新、连续导航和播放失败均不阻塞阅读。
- 发布：完成一次内容修改、commit、push 到 Pages 更新的记录，核对 commit 标识与耗时；构建失败保留旧版。
- 扩展：用一个示例新栏目证明可配置扩展；同一构建在根路径和仓库子路径可用，并提供 VPS 静态部署说明。
- 模板：从独立模板仓库生成一个最小示例站，替换 identity、主题 preset 和一个板块后可构建；模板产物不包含 Manting Guo 的个人资料、照片、邮箱或商业音轨。
- 联动：版本化公开 JSON 与页面一致；无后端、超时及错误响应时主页可用；未来动态接口契约有文档。
- 可用性：桌面/手机、键盘、减少动画、音频不可用及无 JavaScript 情况均有对应验收记录。

以上是后续实现的验收要求，本次只修订需求文档，尚未执行产品测试或完成上述验收。

## Approval

- Requirements approved by user: `yes — 2026-09-28`

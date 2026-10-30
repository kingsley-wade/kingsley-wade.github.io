# MOTIVATION.EXE — publications 互动彩蛋设计

- 日期:2026-10-30
- 状态:已与用户确认(v4/v5 mockup,http://localhost:53359 会话)
- 范围:publications 面板内嵌互动组件 + 全局终端三条彩蛋命令

## 目标

在 publications 页(自嘲开场白 "Not many papers yet — I asked Einstein…")下方,
给访客一个终端风格的连续对话互动:访客可以**催更**(push manting)或**找爱因斯坦
谈大脑捐赠**(ask einstein),用幽默自嘲的方式化解"论文还少"的尴尬,不出现
"lazy / 被监视"之类的负面表述。

## 组件:MOTIVATION.EXE 面板

新组件 `src/components/MotivationExe.astro`,渲染在 AppShell 的 publications
分组块(`.publication-groups`)末尾、开场白(`.publication-intro`)之后。

### 视觉

- 复用全站终端样式(深底 `#1c1a17`、等宽字体、`4a443a` 边框,同 `.global-terminal` 风格)
- 面板标题 `> MOTIVATION.EXE`,内容区为逐行追加的对话流(打字机效果)
- 底部两个按钮:`PUSH MANTING` / `ASK EINSTEIN`(不要用 "PUSH HIM")
- 状态行:`nudges: N · einstein's generosity: X.XX% · "your click counts. science says so."`
- `prefers-reduced-motion` 时跳过打字机动画,直接显示整段文本

### 对话流程

1. **开场**:组件进入视口后自动播一段——
   `> you: any new papers?` → manting 随机回一句(候选见台词库)
2. **每轮**:访客点按钮,对话追加一段,可无限轮:
   - `PUSH MANTING`:`> you: [PUSHED MANTING] harder, please.` → manting 随机
     催更回复;nudge 计数 +1
   - `ASK EINSTEIN`:`> you: professor, would you donate your brain to speed
     up my publications?` → einstein 回复;generosity += 3.14%
3. **Einstein 彩蛋**:第 6 次 ASK 后 generosity 显示 `100.00%`,回复固定为
   `fine. 100%. but you get the hair too.`;之后再点循环输出低百分比借口(不重置存档)

### 台词库

每个随机池约 15 条,集中放在 `src/lib/motivation/lines.ts` 一个文件里,
纯字符串数组,便于后续扩充修改(加一行即生效,无需动其他代码)。

Manting 开场/催更回复(同一池,随机,~15 条):
- `noted. this is legally binding motivation now.`
- `nudges convert to pages at roughly 0.01 pages each.`
- `einstein's brain would help, but he's still "thinking about it".`
- `my reviewers are also nudging. everyone is nudging.`
- `thank you. tell your friends. citations count double.`
- `define "new". my drafts are aging like wine, though.`
- `peer review is also asking. we're all asking.`
- `submitting is a 2027 problem. drafting is forever.`
- …(补足至 15 条,见 lines.ts)

Einstein 台词分两段:
- **常规池(~14 条随机借口)**,配当前 generosity 百分比:
  `interesting proposal. my current generosity: X%`、`relative to my output,
  that's a generous offer.`、`my estate lawyers say hi.`、
  `cite my 1905 papers and we'll revisit.`、`space is curved, deadlines are not.` …
- **彩蛋**:第 6 次 ASK 时 generosity 锁定 `100.00%`,固定回复
  `fine. 100%. but you get the hair too.`;之后继续 ASK 则从常规池随机循环(存档不重置)

## 终端彩蛋

`src/lib/terminal/commands.ts` 新增三条命令(加入 `terminalCommandIds` 与 help 的
INTERACTIONS 分组):

| 命令 | 行为 |
| --- | --- |
| `ask manting` | 输出随机开场回答(与面板同台词库) |
| `nudge` | nudge +1,输出随机催更回复与当前计数 |
| `ask einstein` | 输出下一段 Einstein 对话与当前 generosity |

终端命令与面板共享同一个状态模块,互相同步。

## 状态与数据

- 新模块 `src/lib/motivation/store.ts`:localStorage 读写
  `{ nudges: number, asks: number }`,key `motivation-exe-v1`;
  generosity 派生值 = min(asks × 3.14, 100),asks ≥ 6 时锁定 100 并启用彩蛋文案
- 纯前端,无后端、无网络请求;localStorage 不可用时优雅降级(每次会话从 0 开始)
- 台词与百分比常量集中在 `src/lib/motivation/lines.ts`,便于后续改文案

## 测试

- 单元测试:`src/lib/motivation` 的状态派生(generosity 计算、彩蛋边界第 6 次)、
  台词随机函数(固定 seed 下确定性)
- e2e(chromium):打开面板 → 开场对话出现 → 点 PUSH MANTING 对话追加且计数 +1 →
  点 ASK EINSTEIN generosity 变 6.28% → 终端 `nudge` 后面板计数同步
- 终端命令解析:新命令进 `terminalCommandIds` 后 parser/help 测试更新

## 不做(YAGNI)

- 无后端/全局计数器(每个访客本地计数)
- 无头像/图片素材
- 不做动画复杂化:只有打字机 + 按钮点击,无粒子/音效

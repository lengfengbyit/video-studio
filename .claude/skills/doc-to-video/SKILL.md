---
name: doc-to-video
description: 把一篇技术文档、调研报告或文章做成带中文配音、字幕、音效的讲解/分享视频（1920×1080 MP4），基于本机 video-studio（Remotion）项目。当用户说「给这个文档生成视频」「把这篇文章做成分享视频」「做一支讲解视频」「文档转视频」，或要修改、重新导出 video-studio 里已有的某支视频时使用。依赖 macOS（配音用系统 say）。
---

# doc-to-video：文档 → 分享视频

## 项目位置

video-studio 仓库默认在 `/Users/feng/Documents/code/video-studio`。
本 skill 就放在仓库的 `.claude/skills/doc-to-video/` 下，全局入口 `~/.claude/skills/doc-to-video` 是指向它的软链，所以也可以用 `readlink -f ~/.claude/skills/doc-to-video/../../..` 反查仓库根目录。
找不到仓库时先问用户，不要另起一个新项目。

下文所有命令都在仓库根目录执行。

## 关键规则（先读）

- 一支视频 = `src/videos/<id>/` 下的一个 `VideoDef`。框架 `src/framework/` 一般不改。
- **配音决定时长**：场景帧数由 `npm run audio <id>` 测出配音长度后写进 `audioMeta.json`。改了 `narration.json` 必须重跑。
- `narration.json` 的 key 必须和 `scenes.tsx` 里 `SceneEntry.id` 一一对应，**顺序也保持一致**（预览脚本按 narration 顺序计算帧号）。
- 脚手架不会注册视频，要手动把 `<camelId>Video` 加进 `src/videos/index.ts` 的 `VIDEOS` 数组。
- 场景内取色用 `usePalette()` 或在数据里用 `theme.green / theme.red / theme.yellow`，不要随手写十六进制色值。
- 所有动画必须由帧驱动（`useReveal` / `useWindowProgress` / `spring` / `interpolate`），禁止 CSS transition/animation。
- 本机 `npx` 有 nvm 相关报错，统一用 `./node_modules/.bin/remotion` 和 `./node_modules/.bin/tsc`。

## 工作流程

### 1. 读懂文档，定场景清单

先通读源文档，提炼出 10～18 个场景（约 3～5 分钟）。常见骨架：

1. 标题页（TitleScene）
2. 问题 / 背景（ListScene，2～4 张卡）
3. 核心概念或总览（ListScene / PipelineScene / 专属场景）
4. 主体：逐个展开要点（同一种版式反复使用，保持节奏统一）
5. 方法论 / 实践建议（PipelineScene）
6. 坑与反模式（ListScene）
7. 回顾收尾（RecapScene）

每个场景只讲一件事。文档里有「演进 / 分级 / 步骤」结构时，优先用同一个专属版式逐级展开。
范围不明确（只讲某几章？面向谁？时长？）时先和用户确认。

### 2. 选原型，必要时写专属场景

先看 [references/scene-catalog.md](references/scene-catalog.md)：6 种原型的 props、版面安全区、文字长度上限。
原型放不下时，在 `src/videos/<id>/scenes/` 写专属场景（复制 `src/framework/scenes/_Blank.tsx` 起步），参考已有的
`src/videos/agent-memory/scenes/LevelScene.tsx`（问题→方案→解决→缺陷四段式）和 `LadderScene.tsx`（阶梯总览）。

### 3. 脚手架 + 注册

```bash
npm run new <id> "<标题>"          # id 用 kebab-case，例如 agent-memory
mkdir -p src/videos/<id>/scenes     # 需要专属场景时
```

然后编辑 `src/videos/index.ts`，import 并加入 `VIDEOS`（放第一位，Studio 打开就是它）。
在 `video.tsx` 设置配色：`palette: makePalette({ accent: "#...", accent2: "#..." })`，选一组和已有视频不撞色的强调色。

### 4. 写 narration.json 与 scenes.tsx

文案规则见 [references/narration-guide.md](references/narration-guide.md)。要点：

- 语速约 **5 字/秒**，单场景旁白 40～110 字（8～20 秒）。
- `captions` 2～3 条，每条 ≤ 20 字，按顺序概括旁白，字幕会按字数加权铺满时间轴。
- 文案写给耳朵听：少用括号、缩写和符号；英文缩写尽量换成中文说法。
- 结构化数据多的场景（如逐级展开）把数据抽到单独的 `*.ts`，`scenes.tsx` 用 `map` 生成。
- 音效：`sfx: [{ file: "ding.wav", at: <场景本地帧>, volume: 0.4 }]`，`at` 对齐到元素的 reveal 延迟（如 PipelineScene 结论横幅在 `14 + stages.length * 15` 帧出现）。可用 `whoosh` / `ding` / `ding-bright` / `type`。过场 whoosh 自动加，不用写。

### 5. 生成配音

```bash
npm run audio <id>
```

输出每个场景的秒数和帧数。单场景超过 20 秒说明文案太长，回去删。

### 6. 校验

```bash
./node_modules/.bin/tsc --noEmit
python3 .claude/skills/doc-to-video/scripts/preview_stills.py <id>      # 每个场景导出一张截图
```

脚本把截图写到 `/tmp/<id>-stills-<时分秒>/<序号>-<sceneId>.png`，取每个场景 60% 处的帧（入场动画已结束），每次运行都是新目录，不会读到旧图。
**逐张用 Read 查看截图**，重点检查：文字意外换行、卡片溢出、内容压到底部字幕区、颜色是否统一。
只看部分场景：`preview_stills.py <id> title recap`。全片 17 个场景截图约需 2～3 分钟。

### 7. 导出

```bash
./node_modules/.bin/remotion render <id> out/<id>.mp4 --log=error
```

4 分钟左右的视频导出需要几分钟，用后台任务跑。`out/` 已被 git 忽略。

### 8. 汇报

告诉用户：输出路径、时长、场景结构、新增文件、哪些校验做了、哪些没做（例如没有完整观看）。
提交代码前先问用户；`public/audio/<id>/` 的配音 wav 按仓库惯例一并提交。

## 修改已有视频

- 只改文案：改 `narration.json` → `npm run audio <id>` → 截图校验 → 导出。
- 改版式或数据：改 `scenes.tsx` / 专属场景 → `tsc` → 截图校验 → 导出（不需要重新配音）。
- 改了 `scripts/gen_audio.py` 的 `HEAD_PAD` / `TAIL_PAD`，必须同步 `src/framework/components/SceneAV.tsx` 的同名常量。

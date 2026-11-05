# 场景目录：原型 props、版面与文字上限

画布 1920×1080。左右边距 90px，可用宽度 1740px。

## 版面安全区（所有场景通用）

| 区域 | y 范围 | 说明 |
| --- | --- | --- |
| 头部 SceneHeader | 70 ～ 约 290 | 步骤徽标 + 标题（64px）+ 副标题（30px） |
| 内容区 | 330 ～ 860 | 场景主体放这里 |
| 结论横幅 | bottom 190～215 | PipelineScene / ExchangeScene 的 result、conclusion |
| 字幕区 | bottom 72 起，约 y 930～1010 | **内容不能压进来** |

## 原型（`src/framework/scenes/`）

所有带头部的原型都有 `step` / `total` / `title` / `subtitle?`。`step/total` 显示为徽标「01 / 04」，通常按章节编号，不必每个场景递增。

### TitleScene：开场标题

```tsx
<TitleScene kicker="技术分享 · 领域" title={"主标题第一行\n第二行"} />
```

- 标题 100px，每行 ≤ 15 个汉字，最多 2 行。

### ListScene：2～4 张并排要点卡

```tsx
<ListScene step={1} total={4} title="..." subtitle="..."
  items={[{ label: "要点", desc: "说明", color?: theme.red }]} />
```

- 卡片最大宽 420px，内容居中。label 34px，**≤ 9 个汉字**；desc 26px，每行约 14 字，**≤ 28 字**（2 行）。
- 不填 `color` 按调色板循环取色。5 张卡也能放，但每张会变窄，desc 要更短。

### PipelineScene：箭头串联的流程

```tsx
<PipelineScene step={2} total={4} title="..." subtitle="..."
  stages={[{ icon: "📜", name: "阶段", desc: "说明" }]}
  result="底部渐变结论（可选）" />
```

- 3～5 个阶段。5 个阶段时 name 30px **≤ 6 个汉字**（英文约 12 个字符），desc 23px **≤ 11 个汉字**。
  反例：`CLAUDE.md + grep` 放在 name 里会折行，应写成 `name: "即时检索", desc: "L6 · CLAUDE.md + grep"`。
- 入场节奏：第 i 个阶段在 `12 + i*15` 帧出现，result 在 `14 + stages.length*15` 帧出现（音效可对齐这里）。
- result 38px，≤ 30 字。

### CodeScene：代码 / 公式卡

```tsx
<CodeScene step={3} total={5} title="..." subtitle="..." filename="卡片顶部标签"
  lines={[{ text: "# 注释", color: theme.textDim }, { text: "", color: theme.text }]} />
```

- 卡宽 1200px，等宽 30px，行高 51px。**≤ 8 行**；每行 ≤ 60 个 ASCII 字符或 ≤ 36 个汉字。
- 空行用 `{ text: "" }`。第 i 行在 `14 + i*7` 帧出现。

### ExchangeScene：两端之间的请求 / 响应往返

```tsx
<ExchangeScene step={4} total={5} title="..." subtitle="..."
  left={{ icon: "🧑‍💻", label: "调用方" }} right={{ icon: "🧠", label: "模型服务" }}
  messages={[{ label: "请求", dir: "ltr" }, { label: "响应", dir: "rtl" }]}
  conclusion="底部结论（可选）" />
```

- messages ≤ 6 条，label 26px，≤ 16 字。

### RecapScene：回顾时间线 + 收尾大标题

```tsx
<RecapScene steps={["为什么", "两层", "实践"]} title="一句话结论" subtitle="补充" />
```

- 每个步骤名宽 130px（22px 字），**≤ 5 个汉字**，否则折行。最多约 9 个步骤。
- title 84px，≤ 18 字；不使用 SceneHeader。

## 专属场景示例（`src/videos/agent-memory/scenes/`）

### LevelScene：问题 → 方案 → 解决了什么 → 缺陷 → 何时用

适合「分级演进」「多个方案逐一评述」类内容。props：`level`、`total`、`name`、`problem`、`solution`、`solved[]`、`defects[]`、`when`。
右上角迷你阶梯标出当前级。solution 32px ≤ 45 字；列表项 28px ≤ 24 字，每栏 2～3 项。

### LadderScene：阶梯式总览

props：`step`、`total`、`title`、`subtitle`、`levels[]`、`trends?: {text,color}[]`。
台阶从左到右升高，名称 24px，9 级时 ≤ 6 个汉字。趋势标签在 `12 + levels.length*8 + 8` 帧出现。

复用方式：把文件复制到新视频的 `scenes/` 目录再改，不要跨视频 import（每支视频保持独立）。

## 写专属场景的规则

- 从 `src/framework/scenes/_Blank.tsx` 复制起步，顶部用 `<SceneHeader>`。
- 依次浮现用 `useReveal(delay)`；位移 / 进度用 `useWindowProgress(start, dur)`；都在 `src/framework/components/ui.tsx`。
- 只动画 `transform` / `opacity`。需要「长出来」效果时用 `translateY` 加外层 `overflow: hidden`，不要动画 `height`。
- 取色：`const p = usePalette()`，用 `p.accent / p.accent2 / p.green / p.red / p.yellow / p.gradient`；结构色用 `theme.surface / theme.border / theme.text / theme.textDim`。
- 可复用小件：`Card`、`NodeBox`、`Chip`（`ui.tsx`）。

// ============================================================
//  视频脚本：Agent Harness 的上下文与记忆工程
//  - 内容来源：context-memory-research/agent-context-memory.md
//  - id 必须与同目录 narration.json 的 key 对应
//  - 改完文案后运行 `npm run audio agent-memory`，场景时长按配音自动重算
// ============================================================
import React from "react";
import type { SceneEntry } from "../../framework/types";
import { theme } from "../../framework/theme";
import { TitleScene } from "../../framework/scenes/TitleScene";
import { ListScene } from "../../framework/scenes/ListScene";
import { PipelineScene } from "../../framework/scenes/PipelineScene";
import { RecapScene } from "../../framework/scenes/RecapScene";
import { LadderScene } from "./scenes/LadderScene";
import { LevelScene } from "./scenes/LevelScene";
import { LEVEL_SCENES } from "./levels";

// 章节总数（非「级」场景的步骤徽标用）
const CHAPTERS = 4;

const LEVEL_NAMES = ["全量上下文", "截断", "摘要压缩", "精细修剪", "结构化笔记", "检索式记忆", "分层自管理", "多智能体隔离", "记忆治理"];

export const SCENES: SceneEntry[] = [
  // 1. 开场
  {
    id: "title",
    node: <TitleScene kicker="技术分享 · Agent Harness" title={"Agent 的\n上下文与记忆工程"} />,
  },

  // 2. 三个硬约束
  {
    id: "constraints",
    node: (
      <ListScene
        step={1}
        total={CHAPTERS}
        title="为什么「上下文不够」是工程问题"
        subtitle="上下文是有限的注意力预算，不是免费硬盘"
        items={[
          { label: "窗口上限", desc: "超过最大 token 数就报错或被硬截断，任务中断" },
          { label: "注意力衰减", desc: "token 越多越容易漏看，中部信息最易被忽略" },
          { label: "成本 · 延迟 · 缓存", desc: "按 token 计费，首字延迟上升，改前缀即缓存失效", color: theme.red },
        ]}
      />
    ),
  },

  // 3. 记忆的三个存放位置
  {
    id: "tiers",
    node: (
      <ListScene
        step={1}
        total={CHAPTERS}
        title="记忆可以放在三个地方"
        subtitle="核心工作：在上下文与外部存储之间高效搬运"
        items={[
          { label: "参数记忆", desc: "模型权重 · 更新最慢、不可控，只适合稳定的领域风格" },
          { label: "上下文记忆", desc: "当前 prompt · 最精确，但容量小、贵、会话结束即消失" },
          { label: "外部记忆", desc: "文件 / 向量库 / 数据库 · 容量近乎无限，但读取有损" },
        ]}
      />
    ),
  },

  // 4. 九级演进总览
  {
    id: "ladder",
    node: (
      <LadderScene
        step={2}
        total={CHAPTERS}
        title="九级演进：每一级修补上一级的缺陷"
        subtitle="问题 → 方案 → 解决了什么 → 留下什么缺陷 → 下一个方案"
        levels={LEVEL_NAMES}
        trends={[
          { text: "Token 效率 ↑", color: theme.green },
          { text: "可观测性 ↓", color: theme.red },
        ]}
      />
    ),
    sfx: [{ file: "ding.wav", at: 92, volume: 0.4 }],
  },

  // 5~13. 逐级展开
  ...LEVEL_SCENES.map(({ id, ...props }, i) => ({
    id,
    node: <LevelScene level={i + 1} total={LEVEL_SCENES.length} {...props} />,
  })),

  // 14. 建设顺序：别跳级
  {
    id: "order",
    node: (
      <PipelineScene
        step={3}
        total={CHAPTERS}
        title="最常见的错误：跳级"
        subtitle="工具输出没压缩、状态没外置，就先搭向量库"
        stages={[
          { icon: "✂️", name: "先做减法", desc: "少产生" },
          { icon: "🗜️", name: "再做压缩", desc: "少保留" },
          { icon: "🔎", name: "最后检索", desc: "精准取回" },
        ]}
        result="每个阶段先做「可观测」，再做「自动化」"
      />
    ),
    sfx: [{ file: "ding-bright.wav", at: 59, volume: 0.45 }],
  },

  // 15. Coding Agent 推荐配方
  {
    id: "recipe",
    node: (
      <PipelineScene
        step={3}
        total={CHAPTERS}
        title="配方：Coding Agent 怎么搭"
        subtitle="长任务、多文件、工具输出巨大"
        stages={[
          { icon: "✂️", name: "输出减量", desc: "L4 · 结构化 + 清理" },
          { icon: "📝", name: "状态外置", desc: "L5 · PROGRESS + git" },
          { icon: "🗜️", name: "上限压缩", desc: "L3 · 永不压缩区" },
          { icon: "🤖", name: "子 Agent", desc: "L8 · 大范围搜索" },
          { icon: "🔎", name: "即时检索", desc: "L6 · CLAUDE.md + grep" },
        ]}
        result="不建议：一上来做向量库，或把整个仓库塞进上下文"
      />
    ),
  },

  // 16. 常见的坑
  {
    id: "pitfalls",
    node: (
      <ListScene
        step={4}
        total={CHAPTERS}
        title="四个常见的坑"
        subtitle="反模式比方案更值得记住"
        items={[
          { label: "只压缩不锚定", desc: "原始目标、验收标准要放进「永不压缩区」" },
          { label: "摘要代替原文", desc: "代码、报错、配置只留「指针 + 可重读」" },
          { label: "无界写入", desc: "没有去重、过期、删除，半年变噪声库" },
          { label: "忽略缓存", desc: "稳定前缀字节级不变，易变内容放尾部" },
        ]}
      />
    ),
  },

  // 17. 回顾收尾
  {
    id: "recap",
    node: (
      <RecapScene
        steps={["全量", "截断", "压缩", "修剪", "笔记", "检索", "分层", "隔离", "治理"]}
        title="在正确的时刻，放进最必要的信息"
        subtitle="上下文工程的本质，是注意力预算管理"
      />
    ),
  },
];

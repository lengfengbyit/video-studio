// 九级演进的数据：每一级按「问题 → 方案 → 解决了什么 → 缺陷 → 何时用」组织
// id 与 narration.json 的 key 一一对应
export type LevelData = {
  id: string;
  name: string;
  problem: string;
  solution: string;
  solved: string[];
  defects: string[];
  when: string;
};

export const LEVEL_SCENES: LevelData[] = [
  {
    id: "l1-full",
    name: "全量上下文",
    problem: "起点：把一切原样拼进 prompt",
    solution: "不做任何裁剪，messages 数组原样增长",
    solved: ["实现成本为零", "信息零损失，调试最直观"],
    defects: ["十几轮工具调用就撞上窗口", "长上下文开始漏看关键约束", "成本与延迟随轮数线性上涨"],
    when: "对话少于 20 轮、单次任务、原型验证",
  },
  {
    id: "l2-trim",
    name: "截断与滑动窗口",
    problem: "历史无限增长，窗口装不下",
    solution: "只保留最近 N 轮，或按 token 预算从旧到新丢弃",
    solved: ["一行代码解决超窗崩溃", "行为可预测，无额外模型调用"],
    defects: ["无差别遗忘，最早的目标先丢", "tool_call 配对断裂导致报错", "长任务后半段忘了初衷"],
    when: "永远保留作兜底，但不能是唯一策略",
  },
  {
    id: "l3-compact",
    name: "摘要压缩",
    problem: "截断丢太多，能否压缩而不是丢弃？",
    solution: "接近阈值时把旧历史总结成结构化摘要，保留最近几轮原文",
    solved: ["保住目标、进展与关键决策", "支撑数小时的连续任务"],
    defects: ["有损且不可逆，多次递归会漂移", "每次压缩都是一次额外大调用", "重写历史，前缀缓存全部失效"],
    when: "长会话必备，配合「永不压缩区」",
  },
  {
    id: "l4-prune",
    name: "精细修剪",
    problem: "token 大头是工具返回的原始内容",
    solution: "清理旧工具结果 · 输出结构化与分页 · 单条消息微压缩",
    solved: ["体积降一个数量级，几乎不丢决策信息", "无需大模型调用，对缓存友好"],
    defects: ["可能删掉以后才显得重要的细节", "每个工具都要设计压缩后的表示", "仍然只限单会话"],
    when: "所有 Agent 都应该做，优先级高于摘要",
  },
  {
    id: "l5-notes",
    name: "结构化笔记",
    problem: "上下文一重置，一切归零",
    solution: "Agent 主动维护 PROGRESS.md、TODO、CLAUDE.md、交接文档",
    solved: ["压缩、清空、换会话都不再失忆", "人类可读、可审计、可手工修正"],
    defects: ["写什么、何时写全靠模型自觉", "笔记会过期，前后可能矛盾", "笔记一多，不知该读哪份"],
    when: "所有超过 30 分钟的任务 · 投入产出比最高",
  },
  {
    id: "l6-retrieval",
    name: "检索式记忆",
    problem: "写下来了，但找不到",
    solution: "向量预检索 + grep / glob 即时检索，按需注入少量片段",
    solved: ["容量近乎无限，每次只花少量 token", "跨会话记忆真正成立"],
    defects: ["漏召回难察觉，推理悄悄跑偏", "片段碎片化，相似 ≠ 有用", "检索内容可能带提示注入"],
    when: "先做「文件 + grep」，确有瓶颈再上向量库",
  },
  {
    id: "l7-tiered",
    name: "分层自管理记忆",
    problem: "该记住什么，应由 Agent 自己决定",
    solution: "主上下文 + 回忆存储 + 归档存储，Agent 用函数调用自主换入换出",
    solved: ["写入与淘汰由 Agent 决策", "支持提升、更新与删除"],
    defects: ["依赖模型自律，额外调用多", "可观测性急剧下降", "错误记忆会长期污染"],
    when: "产品化、长期陪伴型 Agent",
  },
  {
    id: "l8-subagent",
    name: "多智能体隔离",
    problem: "有些中间过程本就不该进主上下文",
    solution: "子 Agent 在独立窗口里探索，只回传一两千 token 的结论",
    solved: ["主上下文只增长「结论」", "天然并行，墙钟时间下降"],
    defects: ["全局割裂，可能重复或冲突", "关键推理在交接处丢失", "总 token 往往更高"],
    when: "广度型任务；强耦合任务保持单 Agent",
  },
  {
    id: "l9-governance",
    name: "记忆治理与评测",
    problem: "记得越来越多，却越来越不准",
    solution: "写入策略 · 合并抽象 · 衰减遗忘 · 冲突裁决 · 评测",
    solved: ["记忆可维护、可解释、可度量", "长期使用不会越用越傻"],
    defects: ["治理本身是重工程", "自动合并或衰减容易误伤", "评测集构建成本高"],
    when: "记忆超过几百条，或进入长期运营阶段",
  },
];

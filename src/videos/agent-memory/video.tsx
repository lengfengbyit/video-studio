// 主题定义：Agent 上下文与记忆工程
import type { VideoDef } from "../../framework/types";
import { makePalette } from "../../framework/theme";
import { SCENES } from "./scenes";
import narration from "./narration.json";
import audioMeta from "./audioMeta.json";

export const agentMemoryVideo: VideoDef = {
  id: "agent-memory",
  title: "Agent 上下文与记忆工程",
  // 紫→琥珀：「记忆」的温度感，与其他主题的冷色区分
  palette: makePalette({ accent: "#a78bfa", accent2: "#f59e0b" }),
  scenes: SCENES,
  narration,
  audioMeta,
};

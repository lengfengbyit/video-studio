// 专属场景 · 单级方案页：按「问题 → 方案 → 解决了什么 → 留下的缺陷 → 何时用」展开
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { theme } from "../../../framework/theme";
import { usePalette } from "../../../framework/palette";
import { SceneHeader } from "../../../framework/components/SceneHeader";
import { useReveal } from "../../../framework/components/ui";

type Props = {
  level: number; // 第几级（1 起）
  total: number; // 总级数
  name: string; // 方案名
  problem: string; // 这一级要解决的问题（作为副标题）
  solution: string; // 方案一句话
  solved: string[]; // 解决了什么
  defects: string[]; // 留下了什么缺陷
  when: string; // 何时该用
};

export const LevelScene: React.FC<Props> = ({ level, total, name, problem, solution, solved, defects, when }) => {
  const p = usePalette();
  const solR = useReveal(14);
  const whenR = useReveal(30 + Math.max(solved.length, defects.length) * 10 + 8);

  return (
    <AbsoluteFill style={{ fontFamily: theme.font }}>
      <SceneHeader step={level} total={total} title={`第 ${level} 级 · ${name}`} subtitle={`问题：${problem}`} />
      <MiniLadder level={level} total={total} />

      <div style={{ position: "absolute", top: 330, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 24 }}>
        {/* 方案 */}
        <div
          style={{
            opacity: solR,
            transform: `translateY(${interpolate(solR, [0, 1], [24, 0])}px)`,
            display: "flex",
            alignItems: "center",
            gap: 22,
            background: theme.surfaceStrong,
            border: `1px solid ${p.accent}55`,
            borderLeft: `4px solid ${p.accent}`,
            borderRadius: 16,
            padding: "22px 28px",
          }}
        >
          <Tag text="方案" color={p.accent} />
          <div style={{ color: theme.text, fontSize: 32, fontWeight: 700 }}>{solution}</div>
        </div>

        {/* 解决了 / 缺陷 两栏 */}
        <div style={{ display: "flex", gap: 24 }}>
          <Column title="✓ 解决了什么" color={p.green} items={solved} delay={30} />
          <Column title="✗ 留下的缺陷" color={p.red} items={defects} delay={36} />
        </div>
      </div>

      {/* 何时用 */}
      <div
        style={{
          position: "absolute",
          bottom: 190,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: whenR,
          transform: `translateY(${interpolate(whenR, [0, 1], [16, 0])}px)`,
          fontSize: 32,
          fontWeight: 700,
          color: p.yellow,
        }}
      >
        何时用 · {when}
      </div>
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <span
    style={{
      flexShrink: 0,
      fontSize: 24,
      fontWeight: 800,
      color,
      padding: "6px 14px",
      borderRadius: 10,
      background: `${color}1a`,
      border: `1px solid ${color}55`,
    }}
  >
    {text}
  </span>
);

const Column: React.FC<{ title: string; color: string; items: string[]; delay: number }> = ({ title, color, items, delay }) => {
  const headR = useReveal(delay - 6);
  return (
    <div
      style={{
        flex: 1,
        opacity: headR,
        background: theme.surface,
        border: `1px solid ${color}44`,
        borderTop: `3px solid ${color}`,
        borderRadius: 16,
        padding: "22px 28px",
      }}
    >
      <div style={{ color, fontSize: 30, fontWeight: 800, marginBottom: 10 }}>{title}</div>
      {items.map((t, i) => (
        <Item key={t} text={t} color={color} delay={delay + i * 10} />
      ))}
    </div>
  );
};

const Item: React.FC<{ text: string; color: string; delay: number }> = ({ text, color, delay }) => {
  const r = useReveal(delay);
  return (
    <div
      style={{
        opacity: r,
        transform: `translateX(${interpolate(r, [0, 1], [-16, 0])}px)`,
        display: "flex",
        alignItems: "baseline",
        gap: 14,
        color: theme.text,
        fontSize: 28,
        lineHeight: 1.5,
        marginTop: 10,
      }}
    >
      <span style={{ color, fontSize: 18 }}>●</span>
      {text}
    </div>
  );
};

// 右上角的迷你阶梯：标出当前处在第几级
const MiniLadder: React.FC<{ level: number; total: number }> = ({ level, total }) => {
  const p = usePalette();
  const r = useReveal(6);
  return (
    <div style={{ position: "absolute", top: 150, right: 90, display: "flex", alignItems: "flex-end", gap: 6, opacity: r }}>
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i + 1 === level;
        const isPast = i + 1 < level;
        return (
          <div
            key={i}
            style={{
              width: 16,
              height: 16 + i * 7,
              borderRadius: 4,
              background: isCurrent ? p.gradient : isPast ? `${p.accent}66` : theme.border,
              boxShadow: isCurrent ? `0 0 18px ${p.accent}88` : undefined,
            }}
          />
        );
      })}
    </div>
  );
};

// 专属场景 · 演进阶梯：九级台阶依次升起，最后浮现两条趋势标签
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { theme } from "../../../framework/theme";
import { usePalette } from "../../../framework/palette";
import { SceneHeader } from "../../../framework/components/SceneHeader";
import { useReveal, Chip } from "../../../framework/components/ui";

type Trend = { text: string; color: string };

type Props = {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  levels: string[]; // 每级台阶的名称，自下而上
  trends?: Trend[]; // 台阶升起后浮现的趋势标签
};

// 台阶底边的 y 坐标与高度范围
const BASE_Y = 830;
const MIN_H = 90;
const MAX_H = 400;
const BAR_DELAY = 12;
const BAR_STAGGER = 8;

export const LadderScene: React.FC<Props> = ({ step, total, title, subtitle, levels, trends = [] }) => {
  const p = usePalette();
  const trendDelay = BAR_DELAY + levels.length * BAR_STAGGER + 8;

  return (
    <AbsoluteFill style={{ fontFamily: theme.font }}>
      <SceneHeader step={step} total={total} title={title} subtitle={subtitle} />

      {/* 趋势标签 */}
      <div style={{ position: "absolute", top: 330, left: 90, display: "flex", gap: 18 }}>
        {trends.map((t, i) => (
          <Chip key={t.text} text={t.text} color={t.color} delay={trendDelay + i * 10} />
        ))}
      </div>

      {/* 九级台阶 */}
      <div style={{ position: "absolute", top: BASE_Y - MAX_H, left: 90, right: 90, height: MAX_H, display: "flex", alignItems: "flex-end", gap: 16, overflow: "hidden" }}>
        {levels.map((name, i) => {
          const r = useReveal(BAR_DELAY + i * BAR_STAGGER);
          const h = MIN_H + ((MAX_H - MIN_H) * i) / Math.max(levels.length - 1, 1);
          // 颜色沿 accent → accent2 渐变：前半段用 accent，后半段用 accent2
          const color = i < levels.length / 2 ? p.accent : p.accent2;
          return (
            <div
              key={name}
              style={{
                flex: 1,
                height: h,
                // 从底边向上升起：外层 overflow hidden 裁掉未升起部分
                transform: `translateY(${(1 - r) * h}px)`,
                opacity: interpolate(r, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
                background: `linear-gradient(180deg, ${color}33 0%, ${color}0d 100%)`,
                border: `1px solid ${color}66`,
                borderTop: `3px solid ${color}`,
                borderRadius: "14px 14px 4px 4px",
                padding: "16px 10px 0",
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: theme.mono, color, fontSize: 26, fontWeight: 800 }}>L{i + 1}</div>
              <div style={{ color: theme.text, fontSize: 24, fontWeight: 700, marginTop: 6, lineHeight: 1.3 }}>{name}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

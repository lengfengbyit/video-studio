#!/usr/bin/env python3
# 为一支视频的每个场景导出一张截图，用于目检版面（文字折行、溢出、压字幕等）
# 用法：
#   python3 .claude/skills/doc-to-video/scripts/preview_stills.py <id>               # 全部场景
#   python3 .claude/skills/doc-to-video/scripts/preview_stills.py <id> title recap   # 只截指定场景
# 可选环境变量：
#   STILL_AT=0.6   取每个场景时长的哪个比例处的帧（默认 0.6，入场动画已结束）
import json, os, re, subprocess, sys, time

# 仓库根目录：本脚本位于 <root>/.claude/skills/doc-to-video/scripts/（软链也能正确解析）
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "..", "..", ".."))
REMOTION = os.path.join(ROOT, "node_modules", ".bin", "remotion")


def read_transition_frames() -> int:
    # 与 src/framework/types.ts 的 TRANSITION_FRAMES 保持一致
    with open(os.path.join(ROOT, "src", "framework", "types.ts"), encoding="utf-8") as f:
        m = re.search(r"TRANSITION_FRAMES\s*=\s*(\d+)", f.read())
    if not m:
        sys.exit("找不到 TRANSITION_FRAMES，请检查 src/framework/types.ts")
    return int(m.group(1))


def main():
    if len(sys.argv) < 2:
        sys.exit("用法: preview_stills.py <id> [sceneId ...]")
    vid, only = sys.argv[1], set(sys.argv[2:])
    video_dir = os.path.join(ROOT, "src", "videos", vid)
    if not os.path.isdir(video_dir):
        sys.exit(f"找不到视频目录: {video_dir}")
    if not os.path.exists(REMOTION):
        sys.exit(f"找不到 {REMOTION}，请先在仓库根目录执行 npm install")

    with open(os.path.join(video_dir, "narration.json"), encoding="utf-8") as f:
        order = list(json.load(f).keys())
    with open(os.path.join(video_dir, "audioMeta.json"), encoding="utf-8") as f:
        meta = json.load(f)
    missing = [sid for sid in order if sid not in meta]
    if missing:
        sys.exit(f"audioMeta.json 缺少场景 {missing}，请先执行 npm run audio {vid}")
    unknown = only - set(order)
    if unknown:
        sys.exit(f"未知场景 id: {sorted(unknown)}")

    ratio = float(os.environ.get("STILL_AT", "0.6"))
    trans = read_transition_frames()
    # 每次写入新目录，避免查看时读到旧截图
    out_dir = f"/tmp/{vid}-stills-{time.strftime('%H%M%S')}"
    os.makedirs(out_dir, exist_ok=True)

    start = 0
    for i, sid in enumerate(order):
        dur = meta[sid]["durationInFrames"]
        if not only or sid in only:
            frame = start + int(dur * ratio)
            out = os.path.join(out_dir, f"{i + 1:02d}-{sid}.png")
            subprocess.run([REMOTION, "still", vid, out, f"--frame={frame}", "--log=error"], cwd=ROOT, check=True)
            print(f"  {sid:16s} 帧 {frame:6d} -> {out}")
        # 相邻场景有过渡重叠
        start += dur - trans

    print(f"\n总帧数 {start + trans}（约 {(start + trans) / 30:.0f} 秒），截图目录 {out_dir}")


if __name__ == "__main__":
    main()

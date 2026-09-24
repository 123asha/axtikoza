import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ARCHETYPES, GoatActor } from "../web/pen/goats";
import { PixelDivs } from "../web/pen/sprites";

// Contact sheet of all 12 goats, every track on from the first step.
export const HerdPreview: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <PixelDivs.Provider value>
      <AbsoluteFill style={{ background: "#c7ccb9", fontFamily: "monospace", fontSize: 14 }}>
        <style>
          {".tag{position:absolute;transform:translateX(-50%);background:#fff;border:2px solid;padding:2px 4px}" +
            ".shout{position:absolute;transform:translateX(-50%);background:#fff;border:2px solid #333;padding:2px 4px;color:#d4509f}"}
        </style>
        {ARCHETYPES.map((a, i) => (
          <GoatActor
            key={a.id}
            a={a}
            x={40 + (i % 4) * 300}
            y={80 + Math.floor(i / 4) * 260}
            frame={frame}
            fromStep={0}
            seed={i + 1}
          />
        ))}
      </AbsoluteFill>
    </PixelDivs.Provider>
  );
};

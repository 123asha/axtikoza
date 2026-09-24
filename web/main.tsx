import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { Goat, PX, SCENE_H, SCENE_W } from "../src/Goat";

const App: React.FC = () => (
  <Player
    component={Goat}
    durationInFrames={30 * 60 * 30}
    fps={30}
    compositionWidth={SCENE_W * PX}
    compositionHeight={SCENE_H * PX}
    style={{ width: "100%", height: "100%" }}
    autoPlay
    loop
    controls={false}
    clickToPlay={false}
    doubleClickToFullscreen
  />
);

createRoot(document.getElementById("root")!).render(<App />);

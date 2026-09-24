import { Composition } from "remotion";
import { DURATION, Goat, PX, SCENE_H, SCENE_W } from "./Goat";
import { HerdPreview } from "./HerdPreview";

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="Goat"
        component={Goat}
        durationInFrames={DURATION}
        fps={30}
        width={SCENE_W * PX}
        height={SCENE_H * PX}
      />
      <Composition id="Herd" component={HerdPreview} durationInFrames={240} fps={30} width={1240} height={860} />
    </>
  );
};

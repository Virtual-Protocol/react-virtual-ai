import { VRM } from "@pixiv/three-vrm";
import { useEffect, useMemo } from "react";

type Props = {
  vrm?: VRM;
  configs?: {
    [boneName: string]: {
      stiffness?: number;
      dragForce?: number;
      hitRadius?: number;
    };
  };
  setConfigs?: (v: {
    [boneName: string]: {
      stiffness?: number;
      dragForce?: number;
      hitRadius?: number;
    };
  }) => void;
};

export const ModelConfigs: React.FC<Props> = ({ vrm, configs, setConfigs }) => {
  const defaultConfigs: {
    [boneName: string]: {
      stiffness?: number;
      dragForce?: number;
      hitRadius?: number;
    };
  } = useMemo(() => {
    if (!vrm?.springBoneManager?.joints) return {};
    const conf: {
      [boneName: string]: {
        stiffness?: number;
        dragForce?: number;
        hitRadius?: number;
      };
    } = {};
    vrm.springBoneManager.joints.forEach((e) => {
      if (e.bone.name.includes("Skirt")) {
        conf[e.bone.name] = {
          stiffness: 5,
          dragForce: 0.2,
          hitRadius: 1,
        };
        return;
      }
      conf[e.bone.name] = {
        stiffness: 6,
        dragForce: 0.2,
        hitRadius: 1,
      };
    });
    return conf;
  }, [vrm?.springBoneManager?.joints]);

  useEffect(() => {
    if (!!setConfigs && !configs) setConfigs(defaultConfigs);
  }, [configs, defaultConfigs]);

  const bones: {
    name: string;
    stiffness: number;
    dragForce: number;
    hitRadius: number;
  }[] = useMemo(() => {
    if (!vrm?.springBoneManager?.joints) return [];
    return Array.from(vrm.springBoneManager.joints).map((j) => {
      const currentConfig = configs?.[j.bone.name];
      return {
        name: j.bone.name,
        stiffness: currentConfig?.stiffness ?? 0,
        dragForce: currentConfig?.dragForce ?? 0,
        hitRadius: currentConfig?.hitRadius ?? 0,
      };
    });
  }, [vrm?.springBoneManager?.joints, configs]);

  if (!vrm || !setConfigs) return <></>;

  return (
    <div className="virtual-fixed virtual-top-1/2 virtual-right-4 -virtual-translate-y-1/2 virtual-p-4 virtual-rounded-lg virtual-bg-white virtual-h-[80%] virtual-overflow-y-auto virtual-gap-4 virtual-flex virtual-flex-col virtual-z-40 virtual-w-[300px]">
      {bones.map((b, index) => (
        <div
          key={`${b.name}_${index}`}
          className="virtual-flex virtual-flex-col virtual-gap-2"
        >
          <p>{b.name}</p>
          <div className="virtual-flex virtual-flex-row virtual-items-center virtual-gap-2">
            <p className="virtual-w-[180px]">Stiffness:</p>
            <input
              value={b.stiffness}
              placeholder="Stiffness"
              className="virtual-w-full"
              onChange={(e) => {
                setConfigs({
                  ...configs,
                  [b.name]: {
                    stiffness: +e.target.value,
                    hitRadius: b.hitRadius,
                    dragForce: b.dragForce,
                  },
                });
              }}
            />
          </div>
          <div className="virtual-flex virtual-flex-row virtual-items-center virtual-gap-2">
            <p className="virtual-w-[180px]">Hit Radius:</p>
            <input
              value={b.hitRadius}
              placeholder="Hit Radius"
              className="virtual-w-full"
              onChange={(e) => {
                setConfigs({
                  ...configs,
                  [b.name]: {
                    stiffness: b.stiffness,
                    hitRadius: +e.target.value,
                    dragForce: b.dragForce,
                  },
                });
              }}
            />
          </div>
          <div className="virtual-flex virtual-flex-row virtual-items-center virtual-gap-2">
            <p className="virtual-w-[180px]">Drag Force:</p>
            <input
              value={b.dragForce}
              placeholder="Drag Force"
              className="virtual-w-full"
              onChange={(e) => {
                setConfigs({
                  ...configs,
                  [b.name]: {
                    stiffness: b.stiffness,
                    hitRadius: b.hitRadius,
                    dragForce: +e.target.value,
                  },
                });
              }}
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => {
          var dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(configs));
          var downloadAnchorNode = document.createElement("a");
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", "modelConfigs.json");
          document.body.appendChild(downloadAnchorNode); // required for firefox
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
        }}
        className="virtual-bg-black virtual-text-white"
      >
        Export
      </button>
    </div>
  );
};

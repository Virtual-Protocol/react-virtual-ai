export type VirtualConfigType = {
  model: string;
  animations: {
    [part: string]: {
      voice: string;
      url: string;
    };
  };
  parts: {
    [id: string]: {
      startX: number;
      endX: number;
      startY: number;
      endY: number;
    };
  };
  position: number[];
  preloadMotions: {
    uid: string;
    sentiment: string;
    url: string;
  }[];
  stiffness?: number;
};

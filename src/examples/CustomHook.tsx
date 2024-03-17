import { useVirtual } from "../../lib/main";

export const CustomHook = () => {
  const { createPrompt, getTTSResponse } = useVirtual({
    virtualId: 1,
    userName: "Name",
    virtualName: "Virtual",
    initAccessToken: undefined,
    onPromptError: (err) => {
      alert(err);
    },
    metadata: {}, // please fill in required metadata like apiKey, apiSecret
  });

  return (
    <div>
      <button
        onClick={() => {
          createPrompt?.(
            "What is your name?",
            {
              skipTTS: true,
            },
            (e) => {
              console.log("Response", e);
              alert(JSON.stringify(e));
            }
          );
        }}
      >
        Prompt
      </button>
      <button
        onClick={() => {
          getTTSResponse?.("Hello World").then((v) => {
            const audio = new Audio(v);
            audio.load();
            audio.play();
          });
        }}
      >
        TTS
      </button>
    </div>
  );
};

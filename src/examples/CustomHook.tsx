import { UNSAFE_initAccessToken, useVirtual } from "../../lib/main";

export const CustomHook = () => {
  const { virtualService } = useVirtual({
    virtualId: 1,
    userName: "Name",
    virtualName: "Virtual",
    initAccessToken: UNSAFE_initAccessToken,
    onPromptError: (err) => {
      alert(err);
    },
    metadata: {}, // please fill in required metadata like apiKey, apiSecret
  });

  return (
    <div>
      <button
        onClick={() => {
          virtualService?.createPrompt?.(
            "What is your name?",
            {
              skipTTS: true,
              speakOnResponse: false,
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
          virtualService?.getTTSResponse?.("Hello World").then((v) => {
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

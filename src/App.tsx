import { CharacterRoom } from "../lib/components/CharacterRoom/CharacterRoom";

function App() {
  return (
    <div className="w-screen h-screen">
      <CharacterRoom
        userName="User"
        virtualName="Waifu"
        virtualId={1}
        inputClassName="!bottom-[24px]"
        speakerClassName="!bottom-[88px]"
        onUserMessageCreated={async () => {}}
        validateMessageCapability={() => {
          return true;
        }}
        overrideModelUrl="/ignis_nsfw.vrm"
        onVirtualMessageCreated={async () => {}}
        onBeforeSendMessage={() => {}}
        onErrorSendingMessage={() => {}}
        aside={false}
        onInputFocused={() => {}}
        onInputBlurred={() => {}}
        onAudioErr={() => {}}
        debugging
        initAccessToken={async () => {
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJmYTM3ODE5YS0xMmNkLTRiMmEtOTlkMi1mZjZmZWE5M2IxY2UiLCJpZCI6OCwidmlydHVhbCI6IjhhZDU2MGIxLTA2ODktNGM0OS1iNTA0LWQ1MGZkYmY4YzFhNiIsInZpcnR1YWxJZCI6MTIyLCJ1c2VybmFtZSI6Ilhpb25nIG5vIGRlbGV0ZSIsInJ1bm5lciI6Imh0dHBzOi8vZm91Z2h0LWJyYWRsZXktZm9yY2VzLWF2ZXJhZ2UudHJ5Y2xvdWRmbGFyZS5jb20iLCJpYXQiOjE3MDg1NjkzMzUsImV4cCI6MTcwODY1NTczNX0.ZAHZfYhx8F6oxp_FEcFjR1goU_yeYx-sQhijPXaqTucr8rJihLvH4oyzM2UBXlydxSkmdFjNuXaCavzB5CyLn5mhAqgQlHBaHg9NZrko_MFKlBy2kb5LU0TWG1YFRCM6ROx-ilN9U4Zvd0QUHrvd4aRrmkes3M0teVDvcH2QIXM2ZQwlsv2dNK673sXx7D_fU16R3VTNQUSx998cqCqpUrEEZuJDfppY8yzPq8nTUQEOdiBw2Or4vwFYbFVSCfU61H1epoMDn8uuZTEXfxMMSYvYfuIBeC3tTBM77IYmr7HVX4c5D29-JWfHuCF0ELoug8_wODJpbPBN88TxeDaP7A";
        }}
        transformModelUrl={(v) => {
          return v.replace("nocache", "production");
        }}
      ></CharacterRoom>
    </div>
  );
}

export default App;

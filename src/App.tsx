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
        onVirtualMessageCreated={async () => {}}
        onBeforeSendMessage={() => {}}
        onErrorSendingMessage={() => {}}
        aside={false}
        onInputFocused={() => {}}
        onInputBlurred={() => {}}
        onAudioErr={() => {}}
        initAccessToken={async () => {
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidmlydHVhbCI6Ijk3ZjM4MmY3LTg3ODItNDJlNS1hNTkwLTJhMjA5ODg5MDJkMyIsInVzZXJuYW1lIjoiWGlvbmcgbm8gZGVsZXRlIiwiaWF0IjoxNzA4MzMwNzM0LCJleHAiOjE3MDg0MTcxMzR9.I7-nLhEjdUbuwtwz5ar_d1TFUqMSxxIUpJx4caRGFngmByzXGSsy_Pjns6Efc9Kna7p9fu5hN0okxeEHyXLD3paYed8EaYl3mMBsaorRTReBYFKWqDVOcyYTke6ZsNlPpCrGc9F7ddD4O_XcqvrkIjSFuld6HxHVGkLupv11lUK96-XiR_KmyTEJ_x-3vLj8X04_RGUAWr7lxSeYAaSkulXN4cn8ZkgO4RaCZndObxWylCEUpQOvZGa4j0RA5kCzMGU_G7Ca_BxbeB8MocovhJuPU5yyfMzxR7_CNpc_sfMOSCj86prm64foXtyD1LnUvWaXLinJ-BMCTtePfDe_sQ";
        }}
        transformModelUrl={(v) => {
          return v.replace("nocache", "production");
        }}
      ></CharacterRoom>
    </div>
  );
}

export default App;

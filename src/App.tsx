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
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidmlydHVhbCI6IjhhZDU2MGIxLTA2ODktNGM0OS1iNTA0LWQ1MGZkYmY4YzFhNiIsInVzZXJuYW1lIjoiSm9zaCIsInJ1bm5lciI6Imh0dHBzOi8vanVyeS1lbmVyZ3ktZXF1aXBtZW50LXNjb3R0aXNoLnRyeWNsb3VkZmxhcmUuY29tIiwiaWF0IjoxNzA4NDg3MzU1LCJleHAiOjE3MDg1NzM3NTV9.Hjo8bHRJDcb0KPfLyZWT4e1vfiZSre-RxVjaV5kbH1WOEBoDVdOC5CKLQNZb7XxmbVfoZ_mPzNeYo54NwtiTrG4VsON5Bi2F2ksTYGoIAlbbFsaIXifZjPO65a3XkZ00QuX35EWE1vQ7leoIaSxQ1prdwYNgcm3tbDXwEa81Bq7Ey-s6HTpTA2GaydygH_O0IUdoOTVnC67QF3qo0dI9Xjv0IPvkag6Ahii5vyz0lTiCUs50wp7_Q-hu-ZHl1DX6XUycCAdZFy5aRoL0d4YBCjHJwYm1IeFHY_IDwIfr5uzxrHsm6aV1CQ8rPGw7yy62OggtydvQ80wB4lCr1BxCvg";
        }}
        transformModelUrl={(v) => {
          return v.replace("nocache", "production");
        }}
      ></CharacterRoom>
    </div>
  );
}

export default App;

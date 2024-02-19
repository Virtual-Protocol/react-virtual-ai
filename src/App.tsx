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
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidmlydHVhbCI6ImNhNTk2YjJmLTkzYjAtNDc3YS04MzI1LTQ3NTdlMTMyNGMyNyIsInVzZXJJZCI6MSwicnVubmVyIjoiaHR0cHM6Ly92aWNlLWN1cnJlbmNpZXMtbWktd2lyZWxlc3MudHJ5Y2xvdWRmbGFyZS5jb20iLCJpYXQiOjE3MDgzMzAxNzUsImV4cCI6MTcwODQxNjU3NX0.e2ZXl_iKsKvtD9IZPKq56qoOC7tLyuj6aadHz8LKbVnBY5UHqHS_NINyhqnmy6CnmuWKsZSPPjKKMMkAgUcgLXagKPELoUJGNSybfUhPvTQvKFuPKSN6dXOtAjIJwpNvlcQDDOtjPg_Vxj3xwDpJzvxFXOZwIW6jWb_jv456m-y9AZdWIV4X4B9bFJqEbcd2WgA8jfuCB3AdHiAjSlV9RRArQsn-Arf2DQacy3XWCbMkQH16FiIMfo8EMsyJRUh38rlApKtAHkFwMk59wvXjwl-RXmzS6s_aDhiZ3C1PaTYVtvHRukA-6tZXK2cYO_jUXns7moRFX9gX0XB69H0rZg";
        }}
        transformModelUrl={(v) => {
          return v.replace("nocache", "production");
        }}
      ></CharacterRoom>
    </div>
  );
}

export default App;

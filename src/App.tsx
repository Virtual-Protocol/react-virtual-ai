import { CharacterRoom } from "../lib/components/CharacterRoom/CharacterRoom";

function App() {
  return (
    <>
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
          return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidmlydHVhbCI6IjU0NTFlZjM1LTM2Y2MtNGJkZS1iMjgyLTI0MzUxYmM2YzE4NCIsInVzZXJuYW1lIjoiYWJjY2MiLCJpYXQiOjE3MDc5OTY3MzIsImV4cCI6MTcwODA4MzEzMn0.edcy9JxvEbAbyBME7MCJuUX25B0O7SzFvsVOIbFVxHRgN5_HEXxyGaD7ccBJwi4c-XtP6-n7jn5KKBntZ9WW8sKbZzHgirzC_rMDvnLVjiMcde9CbXhwfGAkTgUbKAhTxypqCZHnGOumDH0mKfLj4u2EPdkAENeeU7sar0z2GETfrOEhuMKFxMzSl5Jtsp_-r-GpH3zcuRxLY-xya4l1ibjPQV9hwG8flfGDphu_NWXzRlbdtc30V9zODFFJelyN1q-3nr5jbzJGMuIsuOcjB0vnQ7z7orpR99KiOix82ycNFSQdvJEUwDC-QP9kyKubci7TUge6fb1O2JBhQB7Miw";
        }}
      ></CharacterRoom>
    </>
  );
}

export default App;

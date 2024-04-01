import { CharacterRoom } from "../../lib/components/CharacterRoom/CharacterRoom";
import { UNSAFE_initAccessToken } from "../../lib/utils/initAccessToken";

export const CharacterRoomOnly = () => {
  return (
    <div className="virtual-flex virtual-flex-col virtual-w-screen virtual-flex-1 virtual-h-screen virtual-relative virtual-overflow-y-hidden virtual-bg-black/70">
      <CharacterRoom
        userName="User"
        virtualName="Virtual"
        virtualId={1}
        inputClassName="!virtual-bottom-[24px]"
        onLoadErr={(v) => {
          alert(v);
        }}
        validateMessageCapability={() => {
          return true;
        }}
        aside={false}
        onInputFocused={() => {}}
        onInputBlurred={() => {}}
        onAudioErr={() => {}}
        onPromptError={(e) => {
          alert(e);
        }}
        metadata={{
          apiKey: "NsIH8CSaTz22faE1Z1S1",
          apiSecret: "Y237Dlb3LSd9H3ywzgXyCy7tBlpA0E5lNsb",
          userUid: "1",
          userName: "User Name",
        }}
        configs={{ skipTTS: true }}
        initAccessToken={UNSAFE_initAccessToken}
      ></CharacterRoom>
    </div>
  );
};

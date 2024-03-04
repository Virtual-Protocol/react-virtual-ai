import { ChatMessageDto } from "../../../types/ChatMessageDto";

type Props = {
  message: ChatMessageDto;
};

export const MyTextMessage: React.FC<Props> = ({ message }) => {
  return (
    <div className="flex flex-row self-end relative max-w-[90%]">
      <p className="font-barlow p-2 text-[#111] text-sm bg-[#F0E9FF] rounded-lg whitespace-pre-line">
        {message.message}
      </p>
    </div>
  );
};

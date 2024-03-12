import { ChatMessageDto } from "../../../types/ChatMessageDto";

type Props = {
  message: ChatMessageDto;
};

export const MyTextMessage: React.FC<Props> = ({ message }) => {
  return (
    <div className="virtual-flex virtual-flex-row virtual-self-end virtual-relative virtual-max-w-[90%]">
      <p className="virtual-font-barlow virtual-p-2 virtual-text-[#111] virtual-text-sm virtual-bg-[#F0E9FF] virtual-rounded-lg virtual-whitespace-pre-line">
        {message.message}
      </p>
    </div>
  );
};

import { useMemo } from "react";
import { ChatMessageDto } from "../../../types/ChatMessageDto";
import { getQuotedTexts } from "../../../utils/utils";

type Props = {
  message: ChatMessageDto;
  expanded?: boolean;
};

export const OtherTextMessage: React.FC<Props> = ({ message, expanded }) => {
  const quoted = useMemo(() => {
    return getQuotedTexts(message.message);
  }, [message.message]);

  const highlightedMessages = useMemo(() => {
    // populate start index and end of every highlighted quote
    const indices: { start: number; end: number }[] = [];
    quoted.forEach((quote) => {
      const index = message.message.indexOf(quote);
      indices.push({
        start: index - 1,
        end: index + quote.length + 1,
      });
    });
    const elements: React.JSX.Element[] = [];
    if (indices.length === 0) {
      return [
        <span
          className="text-white whitespace-pre-line"
          key={crypto.randomUUID()}
        >
          {message.message}
        </span>,
      ];
    }
    // handle first element
    if (indices?.[0].start > 0) {
      const text = message.message.slice(0, indices?.[0].start);
      elements.push(
        <span
          className="text-white whitespace-pre-line"
          key={crypto.randomUUID()}
        >
          {text}
        </span>
      );
    }
    // handle other indices
    indices.forEach((ind, index: number) => {
      const highlighted = message.message.slice(ind.start, ind.end);
      elements.push(
        <span
          className="text-yellow-400 whitespace-pre-line"
          key={crypto.randomUUID()}
        >
          {highlighted}
        </span>
      );
      // if there are gaps with next index, add white text
      if (!!indices?.[index + 1] && indices[index + 1].start - ind.end > 0) {
        const notHighlighted = message.message.slice(
          ind.end,
          indices[index + 1].start
        );
        elements.push(
          <span
            className="text-white whitespace-pre-line"
            key={crypto.randomUUID()}
          >
            {notHighlighted}
          </span>
        );
      }
    });
    // handle last element
    if (
      message.message.length -
        (indices?.[(indices?.length ?? 0) - 1]?.end ?? 0) >
      0
    ) {
      const last = message.message.slice(
        indices?.[(indices?.length ?? 0) - 1]?.end ?? 0
      );
      elements.push(
        <span
          className="text-white whitespace-pre-line"
          key={crypto.randomUUID()}
        >
          {last}
        </span>
      );
    }

    return elements;
  }, [message.message, quoted]);

  const simplifiedMessages = useMemo(() => {
    // populate start index and end of every highlighted quote
    const indices: { start: number; end: number }[] = [];
    quoted.forEach((quote) => {
      const index = message.message.indexOf(quote);
      indices.push({
        start: index - 1,
        end: index + quote.length + 1,
      });
    });
    const elements: React.JSX.Element[] = [];
    if (indices.length === 0) {
      return [
        <span
          className="text-white whitespace-pre-line"
          key={crypto.randomUUID()}
        >
          {message.message?.replace(/"/g, "")}
        </span>,
      ];
    }
    // handle other indices
    indices.forEach((ind) => {
      const highlighted = message.message.slice(ind.start, ind.end);
      elements.push(
        <span
          className="text-white whitespace-pre-line"
          key={crypto.randomUUID()}
        >
          {highlighted?.replace(/"/g, " ")}
        </span>
      );
    });

    return elements;
  }, [message.message, quoted]);

  return (
    <div className="flex flex-row relative max-w-[90%] items-center">
      {expanded ? (
        <p className="font-barlow p-2 text-white text-sm bg-black/10 backdrop-blur-2xl rounded-lg whitespace-pre-line">
          {...highlightedMessages}
        </p>
      ) : (
        <p className="font-barlow p-2 text-white text-sm bg-black/10 backdrop-blur-2xl rounded-lg whitespace-pre-line">
          {...simplifiedMessages}
        </p>
      )}
    </div>
  );
};

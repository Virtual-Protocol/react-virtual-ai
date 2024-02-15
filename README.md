# Introduction

`@virtual-protocol/next-virtual` is a NextJS client SDK that offers a collection of React UI components to easily integrate with VIRTUAL to spawn 3D AI character with messaging feature.

Read the documentation at: https://virtualprotocol.gitbook.io/whitepaper/technical-documentation/modular-consensus-framework/inference-by-dapps

## Features

1. **Integration with VIRTUAL**: Integrate conversational AI 3D models into your NextJS applications by utilizing the customizable component.

2. **Customizable Components and Hooks**: `@virtual-protocol/next-virtual` provides a customizable UI component to render animated 3D AI character for you. For complete customizability, you can use the `useVirtualAI` hook to build your own components that integrate with VIRTUAL.

## Usage

To install `@virtual-protocol/next-virtual` in your React project, follow these simple steps:

### Step 1: Install the Package

```bash
npm install @virtual-protocol/next-virtual --save
```

or

```bash
yarn add @virtual-protocol/next-virtual
```

### Step 2: Obtain Your API Key

Follow the VIRTUAL documentation on setting up API key and server to obtain access token.

### Step 3: Implement `initAccessToken` function

This function communicates with your access token API and returns an VIRTUAL-specific access token.

Sample implementation:

```javascript
// This function fetches runner access token and keep in cache
export const initAccessToken = async (virtualId: number) => {
  if (!virtualId) return "";
  // runner token by bot is saved as runnerToken<virtualId> in localStorage
  let cachedRunnerToken = localStorage.getItem(`runnerToken${virtualId}`) ?? "";
  // Fetch a new runner token if expired
  if (!cachedRunnerToken || !validateJwt(cachedRunnerToken)) {
    // Get runner token via dapp server
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return "";
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BE_BASE_URL}/api/auth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          virtualId: virtualId,
        }),
      }
    );
    const respJson = await resp.json();
    cachedRunnerToken = respJson.runnerToken ?? "";
    localStorage.setItem(`runnerToken${virtualId}`, cachedRunnerToken);
  }
  return cachedRunnerToken;
};
```

### Step 4: Put the `CharacterRoom` component

```jsx
import { CharacterRoom } from "@virtual-protocol/next-virtual";

return (
  <CharacterRoom
    userName="User"
    virtualName="Virtual Name"
    virtualId={1} // unique virtual id in number / string
    initAccessToken={initAccessToken}
  />
);
```

If you prefer implementing own components, use the `useVirtualAI` hook as follows:

```javascript
const { modelUrl, createPrompt, virtualConfig, runnerUrl } = useVirtualAI({
  virtualId,
  userName,
  virtualName,
  initAccessToken,
});
```

## API References (WIP)

### useVirtualAI

- `messages`: ChatMessageDto[] - List of messages of the selected chat room.
- `setMessages`: Function - Set the message list
- `activeChat`: number - Active room ID (-1 if undefined)
- `setActiveChat`: Function - Set active room ID
- `chatRooms`: ChatRoom[] - List of chat rooms
- `setChatRooms`: Function - Set chat room list

### CharacterRoom

- `InputComponent`?: React.FC<InputProps> - Override the default `Input` component
- `AICharacterComponent`?: React.FC<AICharacterProps> - Override the default `AICharacter` component
- `aiCharacterStyle`?: CSSProperties - AI Character styles
- `VoiceCallRoomComponent`?: React.FC<VoiceCallRoomProps> - Override the default `VoiceCallRoom` component
- `VoiceCallRoomStyle`?: CSSProperties - VoiceCallRoom styles
- `ChatMessagesComponent`?: React.FC<ChatMessagesProps> - Override the default `ChatMessages` component
- `idleAnimations`: string[] - List of idle animation states
- `modelAnimations`: ModelAnimation[] - List of model animations and states
- `modelPath`: string - Model path URL

## Contributing

We welcome contributions! If you find a bug or have a feature request, please open an issue. Pull requests are also appreciated.

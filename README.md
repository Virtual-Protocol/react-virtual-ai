# Introduction

`@virtual-protocol/react-virtual-ai` is a NextJS client SDK that offers a collection of React UI components to easily integrate with VIRTUAL to spawn 3D AI character with messaging feature.

Read the documentation at: https://virtualprotocol.gitbook.io/whitepaper/technical-documentation/modular-consensus-framework/inference-by-dapps

## Features

1. **Integration with VIRTUAL**: Integrate conversational AI 3D models into your NextJS applications by utilizing the customizable component.

2. **Customizable Components and Hooks**: `@virtual-protocol/react-virtual-ai` provides a customizable UI component to render animated 3D AI character for you. For complete customizability, you can use the `useVirtualAI` hook to build your own components that integrate with VIRTUAL.

## Usage

To install `@virtual-protocol/react-virtual-ai` in your React project, follow these simple steps:

### Step 1: Install the Package

```bash
npm install @virtual-protocol/react-virtual-ai --save
```

or

```bash
yarn add @virtual-protocol/react-virtual-ai
```

### Step 2: Obtain Your API Key

Follow the VIRTUAL documentation on setting up API key and server to obtain access token.

### Step 3: Implement `initAccessToken` function

This function communicates with your access token API and returns an VIRTUAL-specific access token.

Sample implementation:

```javascript
// This function fetches runner access token and keep in cache
export const initAccessToken = async (
  virtualId: number,
  metadata?: { [id: string]: any }
) => {
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
          metadata: metadata,
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
import { CharacterRoom } from "@virtual-protocol/react-virtual-ai";

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
const { modelUrl, createPrompt, runnerUrl } = useVirtualAI({
  virtualId,
  userName,
  virtualName,
  initAccessToken,
});
```

## API References

### useVirtualAI

`virtualId?: number | string`: Unique identifier for the virtual, this value will be passed to initAccessToken function when react-virtual-ai requests for new runner tokens.

`userName?: string`: User's name

`virtualName?: string`: Virtual's name

`initAccessToken: (virtualId: number | string, metadata?: { [id: string]: any }) => Promise<string>`: Function that will return runner access token based on virtual ID and additional metadata. Sample implementation is attached at `Step 3`

`onPromptError?: (error: any) => void`: Callback function when prompt fails.

`metadata?: { [id: string]: any }`: Additional parameters that will be passed to initAccessToken function.

### CharacterRoom

`userName?: string`: User's name

`virtualName?: string`: Virtual's name

`onSendMessage?: Function`: Callback when text message is submitted

`hideVoice?: boolean`: Hide voice input button

`inputClassName?: string`: Input button additional class names

`inputStyle?: CSSProperties`: Input button additional styles

`hideInput?: boolean`: Hide input fields

`zoom?: number`: ThreeJS zoom amount (default 2)

`position?: number[]`: 3D model position (default [0, -10, 0])

`virtualId?: number | string`: virtualId for initAccessToken

`aside?: boolean`: Whether to put 3D model camera aside

`onUserMessageCreated?: (content: any) => Promise<void>`: Callback when user message is created

`onVirtualMessageCreated?: (content: any) => Promise<void>`: Callback when virtual message is created

`onBeforeSendMessage?: () => void`: Callback before sending text or voice message

`onErrorSendingMessage?: (err: any) => void`: Callback when error sending text or voice message

`onInputFocused?: () => void`: Callback when input field is focused

`onInputBlurred?: () => void`: Callback when input field is blurred

`initAccessToken: (virtualId: number | string, metadata?: { [id: string]: any }) => Promise<string>`: Function that returns runner access token, details are in `Step 3`

`onAudioErr?: () => void`: Callback when audio playback error

`validateMessageCapability?: () => boolean`: Validate if user is allowed to send message, return `false` to prohibit user sending message

`overrideModelUrl?: string`: Custom 3D Model URL

`transformModelUrl?: (modelUrl: string) => string`: Function to preprocess model URL and returns a new URL

`onPromptError?: (error: any) => void`: Callback when prompting failed

`metadata?: { [id: string]: any }`: Metadata to attach in initAccessToken function

`loadingText?: string`: Text to show when loading 3D model, default is "Your Virtual is Dressing Up..."

### CharacterScene

`animation: string`: Animation URL, supports .vmd and mixamo .fbx

`modelUrl?: string`: 3D Model URL, supports .vrm

`onAudioEnd?: Function`: Callback when audio playback error happens

`aside?: boolean`: Whether to set 3D model camera aside

`speakCount?: number`: Trigger audio playback when this value changes

`emotion?: "idle" | "think" | "anger" | "disgust" | "fear" | "joy" | "neutral" | "sadness" | "surprise"`: Emotion to play

`zoom?: number`: Camera zoom, default is 2

`position?: number[]`: 3D model position (default [0, -10, 0])

`loadingText?: string`: Text to show when loading 3D model, default is "Your Virtual is Dressing Up..."

`stiffness?: number`: 3D model stiffness, default is 6

### AICharacter

`animation: string`: Animation URL, supports .vmd and mixamo .fbx

`url?: string`: 3D Model URL, supports .vrm

`onAudioEnd?: Function`: Callback when audio playback error happens

`onLoad?: Function`: Callback when 3D model is loaded

`aside?: boolean`: Whether to set 3D model camera aside

`speakCount?: number`: Trigger audio playback when this value changes

`emotion?: "idle" | "think" | "anger" | "disgust" | "fear" | "joy" | "neutral" | "sadness" | "surprise"`: Emotion to play

`position?: number[]`: 3D model position (default [0, -10, 0])

`stiffness?: number`: 3D model stiffness, default is 6

### Input

`value: string`: Text input value

`onChange: ChangeEventHandler<HTMLTextAreaElement>`: On text input value change

`onSubmit: Function`: Callback when submit button is pressed

`disabled?: boolean`: Whether the input field is disabled

`onSubmitVoice: (b: Blob) => void`: Callback on voice submitted

`hideVoice?: boolean`: Whether to hide voice button

`onFocus?: Function`: Callback on input focus

`className?: string`: Additional class names for input field

`Toolbar?: ReactElement`: Additional component above input field

`onBlur?: Function`: Callback on input blur

`style?: CSSProperties`: Additional styles for input field

## Contributing

We welcome contributions! If you find a bug or have a feature request, please open an issue. Pull requests are also appreciated.

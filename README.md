# Introduction

`@virtual-protocol/react-virtual-ai` is a React client SDK that offers a collection of React UI components to easily integrate with VIRTUAL. For non-React frontend frameworks, we also provide several JavaScript helper functions and services to help ease the integration.

Gitbook: https://virtualprotocol.gitbook.io/whitepaper/technical-documentation/modular-consensus-framework/inference-by-dapps

## Features

1. **Plug-and-Play Integration with VIRTUAL**: Integrate conversational AI 3D models into your React applications by utilizing the customizable components.

2. **Customizable Services and Hooks**: To implement own components, you can use the `useVirtual` hook and other helper functions and classes to build your own components that integrate with VIRTUAL.

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

### Step 2: Obtain Your API Key and Secret

Follow the VIRTUAL documentation on creating API key and secret.

### Step 3: Implement `initAccessToken` function

`initAccessToken` prop is available for `CharacterRoom` and `useVirtual` hooks. When using the components in production environment, please keep the API Key and Secret privately in your backend server and override this function to request from your server instead.

By default, the function is implemented by assuming the API key and secret are passed to the metadata parameter.

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
    // Get runner token via your own dapp server
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

### Step 4: Insert the `CharacterRoom` component

There

```jsx
import { CharacterRoom } from "@virtual-protocol/react-virtual-ai";

return (
  <CharacterRoom
    userName="User"
    virtualName="Virtual Name"
    virtualId={1} // unique virtual id in number / string that will define the
  />
);
```

## Other Usages

### useVirtual hook

If you prefer implementing own components, use the `useVirtual` hook as follows:

```javascript
const { modelUrl, createPrompt, getTTSResponse, getLLMResponse } = useVirtual({
  virtualId: 1,
  userName: "",
  virtualName: "",
  initAccessToken: undefined,
  onPromptError: undefined,
  metadata: undefined,
});
```

### Utils

There are several util functions provided, you may utilize separately for specific cases.

`UNSAFE_initAccessToken`: Default function to generate access token. DO NOT use this in production.

`validateJwt`: Validate JWT token expiry

`getVirtualRunnerUrl`: Get virtual runner URL via JWT token

`getQuotedTexts`: Get quoted texts as list via string input

`loadAnimation`: Load VMD / Mixamo FBX animation into VRM model

`fadeByEmotion`: Fade in facial expression for the VRM model

`blink`: Blink the VRM model's eyes

### Components

`AICharacter`: 3D Character with PresentationControl. Must wrap inside ThreeJS Canvas. Utilized in CharacterScene.

`CharacterScene`: 3D Character with Scene. May use this for displaying 3D model and animations. Utilized in CharacterRoom.

`CharacterInput`: Input component for prompting. Utilized in CharacterRoom.

`CharacterRoom`: Full component for React Virtual AI.

### Services

`VirtualService`: VirtualService contains all operations required to send prompt to the VIRTUAL.

`VrmService`: VrmService provides functions to load VRM model and fade to animations.

## Examples

Examples are available in the "examples" folder of the repository.

## API References

JSDocs comments are available in the components, classes and functions. Kindly follow the comments for more details.

## Contributing

We welcome contributions! If you find a bug or have a feature request, please open an issue. Pull requests are also appreciated.

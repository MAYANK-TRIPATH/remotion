---
image: /generated/articles-docs-renderer-select-composition.png
title: selectComposition()
id: select-composition
crumb: "@remotion/renderer"
---

# selectComposition()<AvailableFrom v="4.0.0"/>

Evaluates the list of compositions from a [Remotion Bundle](/docs/terminology#bundle) by evaluating the [Remotion Root](/docs/terminology#remotion-root) and evaluating `calculateMetadata()` on the specified [composition](/docs/terminology#composition).

If you want to get a list of all compositions, use [`getCompositions()`](/docs/renderer/get-compositions).

If no composition with the specified [ID](/docs/terminology#composition-id) exists, then this function will throw.

```tsx twoslash title="Example"
// @module: ESNext
// @target: ESNext
// ---cut---
import { bundle } from "@remotion/bundler";
import { selectComposition } from "@remotion/renderer";

const bundled = await bundle({ entryPoint: require.resolve("./src/index.ts") });
const composition = await selectComposition({
  serveUrl: bundled,
  id: "MyComposition",
});

console.log(composition.id); // "MyComposition"
console.log(composition.width, composition.height);
console.log(composition.fps, composition.durationInFrames);
```

## API

Accepts an object with the following properties:

### `serveUrl`

A string pointing to a [Remotion Bundle](/docs/terminology#bundle) generated by [`bundle()`](/docs/bundle) or a URL that hosts the the bundled Remotion project.

### `id`

The [ID](/docs/terminology#composition-id) of the composition you want to evaluate.

### `logLevel?`

One of `verbose`, `info`, `warn`, `error`. Determines how much is being logged to the console.  
`verbose` will also log `console.log`'s from the browser.

### `port?`

Prefer a specific port that will be used to serve the Remotion project. If not specified, a random port will be used.

### `chromiumOptions?`

See: [Chromium Flags](/docs/chromium-flags)

### `timeoutInMilliseconds?`

A number describing how long the render may take to resolve all [`delayRender()`](/docs/delay-render) calls [before it times out](/docs/timeout). Default: `30000`

### `browserExecutable?`

A string defining the absolute path on disk of the browser executable that should be used. By default Remotion will try to detect it automatically and download one if none is available.

### `onBrowserLog?`

Gets called when your project calls `console.log` or another method from console. See the documentation for [`renderFrames`](/docs/renderer/render-frames#onbrowserlog) for more information.

### `puppeteerInstance?`

An already open Puppeteer [`Browser`](/docs/renderer/open-browser) instance. Reusing a browser across multiple function calls can speed up the rendering process. You are responsible for opening and closing the browser yourself. If you don't specify this option, a new browser will be opened and closed at the end.

### `inputProps?`

React props that can be obtained using [`getInputProps()`](/docs/get-input-props) from inside your project.

### `envVariables?`

An object containing environment variables to be injected in your project.

See: [Environment variables](/docs/env-variables/)

### `offthreadVideoCacheSizeInBytes?`<AvailableFrom v="4.0.23"/>

<Options id="offthreadvideo-cache-size-in-bytes" />

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/renderer/src/select-composition.ts)
- [Server-Side rendering](/docs/ssr)
- [`getCompositions()`](/docs/renderer/get-compositions)
- [`bundle()`](/docs/bundle)

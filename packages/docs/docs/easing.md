---
image: /generated/articles-docs-easing.png
id: easing
title: Easing
crumb: "API"
---

:::info
The Easing API is the exact same as the one from [React Native](https://reactnative.dev/docs/easing) and the documentation has been copied over. Credit goes to them for this excellent API.
:::

The `Easing` module implements common easing functions. You can use it with the [`interpolate()`](/docs/interpolate) API.

You can find a visualization of some common easing functions at http://easings.net/

### Predefined animations

The `Easing` module provides several predefined animations through the following methods:

- [`back`](/docs/easing#back) provides a basic animation where the object goes slightly back before moving forward
- [`bounce`](/docs/easing#bounce) provides a bouncing animation
- [`ease`](/docs/easing#ease) provides a basic inertial animation
- [`elastic`](/docs/easing#elastic) provides a basic spring interaction

### Standard functions

Three standard easing functions are provided:

- [`linear`](/docs/easing#linear)
- [`quad`](/docs/easing#quad)
- [`cubic`](/docs/easing#cubic)

The [`poly`](/docs/easing#poly) function can be used to implement quartic, quintic, and other higher power functions.

### Additional functions

Additional mathematical functions are provided by the following methods:

- [`bezier`](/docs/easing#bezier) provides a cubic bezier curve
- [`circle`](/docs/easing#circle) provides a circular function
- [`sin`](/docs/easing#sin) provides a sinusoidal function
- [`exp`](/docs/easing#exp) provides an exponential function

The following helpers are used to modify other easing functions.

- [`in`](/docs/easing#in) runs an easing function forwards
- [`inOut`](/docs/easing#inout) makes any easing function symmetrical
- [`out`](/docs/easing#out) runs an easing function backwards

## Example

```tsx twoslash
import { AbsoluteFill, useCurrentFrame } from "remotion";
// ---cut---
import { Easing, interpolate } from "remotion";

const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const interpolated = interpolate(frame, [0, 100], [0, 1], {
    easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${interpolated})`,
        backgroundColor: "red",
      }}
    />
  );
};
```

---

# Reference

## Methods

### `step0`

```jsx
static step0(n): number
```

A stepping function, returns 1 for any positive value of `n`.

---

### `step1`

```jsx
static step1(n): number
```

A stepping function, returns 1 if `n` is greater than or equal to 1.

---

### `linear`

```jsx
static linear(t): number
```

A linear function, `f(t) = t`. Position correlates to elapsed time one to one.

http://cubic-bezier.com/#0,0,1,1

---

### `ease`

```jsx
static ease(t): number
```

A basic inertial interaction, similar to an object slowly accelerating to speed.

http://cubic-bezier.com/#.42,0,1,1

---

### `quad`

```jsx
static quad(t): number
```

A quadratic function, `f(t) = t * t`. Position equals the square of elapsed time.

http://easings.net/#easeInQuad

---

### `cubic`

```jsx
static cubic(t): number
```

A cubic function, `f(t) = t * t * t`. Position equals the cube of elapsed time.

http://easings.net/#easeInCubic

---

### `poly()`

```jsx
static poly(n): (t) => number
```

A power function. Position is equal to the Nth power of elapsed time.

n = 4: http://easings.net/#easeInQuart n = 5: http://easings.net/#easeInQuint

---

### `sin`

```jsx
static sin(t): number
```

A sinusoidal function.

http://easings.net/#easeInSine

---

### `circle`

```jsx
static circle(t): number
```

A circular function.

http://easings.net/#easeInCirc

---

### `exp`

```jsx
static exp(t): number
```

An exponential function.

http://easings.net/#easeInExpo

---

### `elastic()`

```jsx
static elastic(bounciness): (t) =>  number
```

A basic elastic interaction, similar to a spring oscillating back and forth.

Default bounciness is 1, which overshoots a little bit once. 0 bounciness doesn't overshoot at all, and bounciness of N > 1 will overshoot about N times.

http://easings.net/#easeInElastic

---

### `back()`

```jsx
static back(s): (t) => number
```

Use with `Animated.parallel()` to create a basic effect where the object animates back slightly as the animation starts.

---

### `bounce`

```jsx
static bounce(t): number
```

Provides a basic bouncing effect.

http://easings.net/#easeInBounce

See an example of how you might use it below

```jsx
interpolate(0.5, [0, 1], [0, 1], {
  easing: Easing.bounce,
});
```

---

### `bezier()`

```jsx
static bezier(x1, y1, x2, y2) => (t): number
```

Provides a cubic bezier curve, equivalent to CSS Transitions' `transition-timing-function`.

A useful tool to visualize cubic bezier curves can be found at http://cubic-bezier.com/

```jsx
interpolate(0.5, [0, 1], [0, 1], {
  easing: Easing.bezier(0.5, 0.01, 0.5, 1),
});
```

---

### `in(easing)`

<!-- prettier-ignore-start -->
```jsx
static in(easing: (t: number) => number): (t: number) => number;
```
<!-- prettier-ignore-end -->

Runs an easing function forwards.

```jsx
{
  easing: Easing.in(Easing.ease);
}
```

---

### `out()`

```jsx
static out(easing: (t: number) => number): (t: number) => number;
```

Runs an easing function backwards.

```jsx
{
  easing: Easing.out(Easing.ease);
}
```

---

### `inOut()`

```jsx
static inOut(easing: (t: number) => number): (t: number) => number;
```

```jsx
{
  easing: Easing.inOut(Easing.ease);
}
```

Makes any easing function symmetrical. The easing function will run forwards for half of the duration, then backwards for the rest of the duration.

## See also

- [Source code for this helper](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/easing.ts)

<Credits contributors={[
{
username: "kaf-lamed-beyt",
contribution: "Improved function signatures"
},
]} />

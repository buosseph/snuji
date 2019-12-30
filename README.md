# snuji ![npm](https://img.shields.io/npm/v/snuji.svg?style=flat-square) [![Build Status](https://travis-ci.org/buosseph/snuji.svg?branch=master)](https://travis-ci.org/buosseph/snuji)

snuji is a context-based middleware implementation.

## Installation

`yarn add snuji`

or

`npm install --save snuji`

## Usage

```tsx
import compose, { Middlware, Handler } from "snuji";

// Define your shared middleware context
type Context = { value: number };

// Define your middleware; each can modify the context before,
// and after, the next middleware in the chain resolves.
const middleware: Middleware<Context>[] = [
	async (ctx, next) => {
		console.debug("Middleware 1 Start");
		ctx.value += 1;
		await next();
		console.debug("Middleware 1 End");
	},
	async (ctx, next) => {
		console.debug("Middleware 2 Start");
		ctx.value += 1;
		await next();
		console.debug("Middleware 2 End");
	}
];

// In an application create your context and run your
// middleware stack, and pass the context to your handler.

// In your application…
(async () => {
	// Instantiate your context
	const ctx: Context = { value: 0 };

	// Compose your middleware
	const stack = compose<Context>(...middleware);

	// Define your handler to be sandwiched by your middleware
	const handler: Handler<Context> = ctx => console.log("Value: " + ctx.value);

	// Pass your context through the middleware and handler stack.
	await stack(ctx, handler);

	// The mutated context is still available after the stack.
})();

// Output:
// Middleware 1 Start
// Middleware 2 Start
// Value: 2
// Middleware 2 End
// Middleware 1 End
```

## Prior Art

This package is based on the middleware implementation included in [`koa`](https://github.com/koajs/koa).

> What does "snuji" mean?

It's a [Lojban gismu](//vlasisku.lojban.org/vlasisku/snuji).
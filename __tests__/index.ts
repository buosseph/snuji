import compose, { Middleware, Handler } from "../lib";

test("mutates context values", async () => {
	type Context = { value: number };

	const middleware: Middleware<Context>[] = [
		async (ctx, next) => {
			ctx.value += 1;
			await next();
		},
		async (ctx, next) => {
			ctx.value += 1;
			await next();
		},
	];

	const ctx: Context = { value: 0 };
	const stack = compose<Context>(...middleware);

	let result = null;
	const handler: Handler<Context> = ctx => { result = ctx.value };
	await stack(ctx, handler);

	expect(result).toBe(2);
});

test("modifies context properties", async () => {
	const middleware: Middleware[] = [
		async (ctx, next) => {
			ctx.a = "a";
			ctx.c = "c";
			await next();
			ctx.f = "f";
		},
		async (ctx, next) => {
			ctx.b = "b"
			delete ctx.c;
			await next();
			ctx.e = "e";
		},
	];

	const ctx = {};
	const stack = compose(...middleware);
	const handler: Handler = ctx => { ctx.d = "d"; };

	await stack(ctx, handler);

	expect(ctx).toEqual({ a: "a", b: "b", d: "d", e: "e", f: "f" });
});

test("resolves with no middleware", async () => {
	const ctx = { foo: "foo" };
	const stack = compose();
	const handler: Handler = ctx => { ctx.bar = "bar" };

	await stack(ctx, handler);

	expect(ctx).toEqual({ foo: "foo", bar: "bar" });
});

test("resolves with no handler", async () => {
	const middleware: Middleware[] = [
		async (ctx, next) => { ctx.bar = "bar"; await next(); },
	];

	const ctx = { foo: "foo" };
	const stack = compose(...middleware);

	// @ts-ignore
	await stack(ctx);

	expect(ctx).toEqual({ foo: "foo", bar: "bar" });
});

test("throws if middleware is not a function", () => {
	expect(() => {
		// @ts-ignore
		compose("a");
	}).toThrowError("Middleware must be a function");
});

test("throws if next() is called multiple times", () => {
	const middleware: Middleware[] = [
		async (_ctx, next) => { await next(); await next(); }
	];

	const stack = compose(...middleware);
	stack({}, () => {}).catch(
		error => expect(error.message).toBe("next() called multiple times"));
});

test("throws if middleware throws", async () => {
	const middleware: Middleware[] = [
		() => { throw new Error("test"); }
	];

	const stack = compose(...middleware);
	stack({}, () => {}).catch(
		error => expect(error.message).toBe("test"));
});
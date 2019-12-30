export type Handler<C extends Record<string, any> = Record<string, any>> =
	(ctx: C) => Promise<void> | void;

export type Middleware<C extends Record<string, any> = Record<string, any>> =
	(ctx: C, next: () => Promise<void> | void) => Promise<void> | void;

/**
 * @example
 * type Context = { value: number };
 * const context: Context = { value: 0 };
 *
 * const middleware = [middleware1, middleware2];
 * const root = compose<Context>(...middleware);
 * const handler = (ctx: Context) => console.log(ctx);
 *
 * (async () => {
 * 	root(context, handler);
 * })();
 */
const compose =
	<C extends Record<string, any> = Record<string, any>>(...middleware: Middleware<C>[]) => {
		middleware.forEach(fn => {
			if (typeof fn !== "function") {
				throw new TypeError("Middleware must be a function");
			}
		});

		return (ctx: C, next: Middleware<C> | Handler<C>) => {
			let index = -1;
			const dispatch = (i = 0): Promise<void> => {
				if (i <= index) {
					return Promise.reject(new Error("next() called multiple times"));
				}

				index = i;
				let fn: Middleware<C> | Handler<C> = middleware[i];

				if (i === middleware.length) {
					fn = next as Handler<C>;
				}

				if (!fn) {
					return Promise.resolve();
				}

				try {
					return Promise.resolve(fn(ctx, dispatch.bind(null, i+1)));
				}
				catch (error) {
					return Promise.reject(error);
				}
			};
			return dispatch();
		};
	};

export default compose;
import type {WebpackOverrideFn} from '@remotion/bundler';
import {BundlerInternals, webpack} from '@remotion/bundler';
import {RenderInternals} from '@remotion/renderer';
import type {IncomingMessage} from 'node:http';
import http from 'node:http';
import {ConfigInternals} from '../config';
import {DEFAULT_TIMELINE_TRACKS} from '../editor/components/Timeline/MaxTimelineTracks';
import {Log} from '../log';
import {wdm} from './dev-middleware';
import {webpackHotMiddleware} from './hot-middleware';
import type {LiveEventsServer} from './live-events';
import {makeLiveEventsRouter} from './live-events';
import {handleRoutes} from './routes';

export const startServer = async (options: {
	entry: string;
	userDefinedComponent: string;
	webpackOverride: WebpackOverrideFn;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
	port: number | null;
	maxTimelineTracks?: number;
	remotionRoot: string;
	keyboardShortcutsEnabled: boolean;
	publicDir: string;
	userPassedPublicDir: string | null;
	poll: number | null;
	staticHash: string;
	staticHashPrefix: string;
	outputHash: string;
	outputHashPrefix: string;
}): Promise<{
	port: number;
	liveEventsServer: LiveEventsServer;
}> => {
	const [, config] = BundlerInternals.webpackConfig({
		entry: options.entry,
		userDefinedComponent: options.userDefinedComponent,
		outDir: null,
		environment: 'development',
		webpackOverride:
			options?.webpackOverride ?? ConfigInternals.getWebpackOverrideFn(),
		maxTimelineTracks: options?.maxTimelineTracks ?? DEFAULT_TIMELINE_TRACKS,
		entryPoints: [
			require.resolve('./hot-middleware/client'),
			require.resolve('./error-overlay/entry-basic.js'),
		],
		remotionRoot: options.remotionRoot,
		keyboardShortcutsEnabled: options.keyboardShortcutsEnabled,
		poll: options.poll,
	});

	const compiler = webpack(config);

	const wdmMiddleware = wdm(compiler);
	const whm = webpackHotMiddleware(compiler);

	const liveEventsServer = makeLiveEventsRouter();

	const server = http.createServer((request, response) => {
		new Promise<void>((resolve) => {
			wdmMiddleware(request as IncomingMessage, response, () => {
				resolve();
			});
		})
			.then(() => {
				return new Promise<void>((resolve) => {
					whm(request as IncomingMessage, response, () => {
						resolve();
					});
				});
			})
			.then(() => {
				handleRoutes({
					staticHash: options.staticHash,
					staticHashPrefix: options.staticHashPrefix,
					outputHash: options.outputHash,
					outputHashPrefix: options.outputHashPrefix,
					request: request as IncomingMessage,
					response,
					liveEventsServer,
					getCurrentInputProps: options.getCurrentInputProps,
					getEnvVariables: options.getEnvVariables,
					remotionRoot: options.remotionRoot,
					entryPoint: options.userDefinedComponent,
					publicDir: options.publicDir,
				});
			})
			.catch((err) => {
				Log.error(`Error while calling ${request.url}`, err);
				if (!response.headersSent) {
					response.setHeader('content-type', 'application/json');
					response.writeHead(500);
				}

				if (!response.writableEnded) {
					response.end(
						JSON.stringify({
							err: (err as Error).message,
						}),
					);
				}
			});
	});

	const desiredPort =
		options?.port ??
		(process.env.PORT ? Number(process.env.PORT) : undefined) ??
		undefined;

	const maxTries = 5;

	const host = RenderInternals.isIpV6Supported() ? '::' : '0.0.0.0';
	const hostsToTry = RenderInternals.isIpV6Supported()
		? ['::', '::1']
		: ['0.0.0.0', '127.0.0.1'];

	for (let i = 0; i < maxTries; i++) {
		try {
			const selectedPort = await new Promise<number>((resolve, reject) => {
				RenderInternals.getDesiredPort({
					desiredPort,
					from: 3000,
					to: 3100,
					hostsToTry,
				})
					.then(({port, didUsePort}) => {
						server.listen({
							port,
							host,
						});
						server.on('listening', () => {
							resolve(port);
							return didUsePort();
						});
						server.on('error', (err) => {
							reject(err);
						});
					})
					.catch((err) => reject(err));
			});
			return {port: selectedPort as number, liveEventsServer};
		} catch (err) {
			if (!(err instanceof Error)) {
				throw err;
			}

			const codedError = err as Error & {code: string; port: number};

			if (codedError.code === 'EADDRINUSE') {
				Log.error(
					`Port ${codedError.port} is already in use. Trying another port...`,
				);
			} else {
				throw err;
			}
		}
	}

	throw new Error(`Tried ${maxTries} times to find a free port. Giving up.`);
};

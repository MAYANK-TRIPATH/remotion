import type {Socket} from 'net';
import http from 'node:http';
import type {DownloadMap} from './assets/download-map';
import type {Compositor} from './compositor/compositor';
import {getDesiredPort} from './get-port';
import {isIpV6Supported} from './is-ipv6-supported';
import type {LogLevel} from './log-level';
import {startOffthreadVideoServer} from './offthread-video-server';
import {serveHandler} from './serve-handler';

export const serveStatic = async (
	path: string | null,
	options: {
		port: number | null;
		downloadMap: DownloadMap;
		remotionRoot: string;
		concurrency: number;
		logLevel: LogLevel;
		indent: boolean;
		offthreadVideoCacheSizeInBytes: number | null;
	},
): Promise<{
	port: number;
	close: () => Promise<void>;
	compositor: Compositor;
}> => {
	const {
		listener: offthreadRequest,
		close: closeCompositor,
		compositor,
	} = startOffthreadVideoServer({
		downloadMap: options.downloadMap,
		concurrency: options.concurrency,
		logLevel: options.logLevel,
		indent: options.indent,
		offthreadVideoCacheSizeInBytes: options.offthreadVideoCacheSizeInBytes,
	});

	const connections: Record<string, Socket> = {};

	const server = http.createServer((request, response) => {
		if (request.url?.startsWith('/proxy')) {
			return offthreadRequest(request, response);
		}

		if (path === null) {
			response.writeHead(404);
			response.end('Server only supports /proxy');
			return;
		}

		serveHandler(request, response, {
			public: path,
		}).catch(() => {
			if (!response.headersSent) {
				response.writeHead(500);
			}

			response.end('Error serving file');
		});
	});

	server.on('connection', (conn) => {
		const key = conn.remoteAddress + ':' + conn.remotePort;
		connections[key] = conn;
		conn.on('close', () => {
			delete connections[key];
		});
	});

	let selectedPort: number | null = null;

	const maxTries = 5;

	const host = isIpV6Supported() ? '::' : '0.0.0.0';
	const hostsToTry = isIpV6Supported()
		? ['::', '::1']
		: ['0.0.0.0', '127.0.0.1'];

	for (let i = 0; i < maxTries; i++) {
		try {
			selectedPort = await new Promise<number>((resolve, reject) => {
				getDesiredPort({
					desiredPort: options?.port ?? undefined,
					from: 3000,
					to: 3100,
					hostsToTry,
				})
					.then(({port, didUsePort}) => {
						server.listen({port, host});
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
			const destroyConnections = function () {
				for (const key in connections) connections[key].destroy();
			};

			const close = async () => {
				await Promise.all([
					new Promise<void>((resolve, reject) => {
						// compositor may have already quit before,
						// this is okay as we are in cleanup phase
						closeCompositor()
							.catch((err) => {
								reject(err);
							})
							.finally(() => {
								resolve();
							});
					}),
					new Promise<void>((resolve, reject) => {
						destroyConnections();
						server.close((err) => {
							if (err) {
								if (
									(err as Error & {code: string}).code ===
									'ERR_SERVER_NOT_RUNNING'
								) {
									return resolve();
								}

								reject(err);
							} else {
								resolve();
							}
						});
					}),
				]);
			};

			return {port: selectedPort, close, compositor};
		} catch (err) {
			if (!(err instanceof Error)) {
				throw err;
			}

			const codedError = err as Error & {code: string; port: number};

			if (codedError.code === 'EADDRINUSE') {
				// Already in use, try another port
			} else {
				throw err;
			}
		}
	}

	throw new Error(`Tried ${maxTries} times to find a free port. Giving up.`);
};

import type {
	AudioCodec,
	Codec,
	ColorSpace,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
	X264Preset,
} from '@remotion/renderer';
import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {Button} from '../../preview-server/error-overlay/remotion-overlay/Button';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {RenderIcon} from '../icons/render';
import {useTimelineInOutFramePosition} from '../state/in-out';
import {ModalsContext} from '../state/modals';
import {Row, Spacing} from './layout';

const button: React.CSSProperties = {
	paddingLeft: 7,
	paddingRight: 7,
	paddingTop: 7,
	paddingBottom: 7,
};

const label: React.CSSProperties = {
	fontSize: 14,
};

export const RenderButton: React.FC = () => {
	const {inFrame, outFrame} = useTimelineInOutFramePosition();
	const {setSelectedModal} = useContext(ModalsContext);
	const {type} = useContext(StudioServerConnectionCtx);

	const connectionStatus = useContext(StudioServerConnectionCtx).type;
	const shortcut = areKeyboardShortcutsDisabled() ? '' : '(R)';
	const tooltip =
		type === 'connected'
			? 'Export the current composition ' + shortcut
			: 'Connect to the Studio server to render';

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 16,
				color: 'currentColor',
			},
		};
	}, []);

	const video = Internals.useVideo();
	const frame = useCurrentFrame();

	const {props} = useContext(Internals.EditorPropsContext);

	const onClick = useCallback(() => {
		if (!video) {
			return null;
		}

		const defaults = window.remotion_renderDefaults;

		if (!defaults) {
			throw new TypeError('Expected defaults');
		}

		setSelectedModal({
			type: 'render',
			compositionId: video.id,
			initialFrame: frame,
			initialStillImageFormat: defaults.stillImageFormat,
			initialVideoImageFormat: defaults.videoImageFormat,
			initialJpegQuality: defaults.jpegQuality,
			initialScale: window.remotion_renderDefaults?.scale ?? 1,
			initialVerbose: (defaults.logLevel as LogLevel) === 'verbose',
			initialConcurrency: defaults.concurrency,
			maxConcurrency: defaults.maxConcurrency,
			minConcurrency: defaults.minConcurrency,
			initialMuted: defaults.muted,
			initialEnforceAudioTrack: defaults.enforceAudioTrack,
			initialProResProfile: defaults.proResProfile as ProResProfile,
			initialx264Preset: defaults.x264Preset as X264Preset,
			initialPixelFormat: defaults.pixelFormat as PixelFormat,
			initialAudioBitrate: defaults.audioBitrate,
			initialVideoBitrate: defaults.videoBitrate,
			initialEveryNthFrame: defaults.everyNthFrame,
			initialNumberOfGifLoops: defaults.numberOfGifLoops,
			initialDelayRenderTimeout: defaults.delayRenderTimeout,
			defaultConfigurationAudioCodec: defaults.audioCodec as AudioCodec | null,
			initialEnvVariables: window.process.env as Record<string, string>,
			initialDisableWebSecurity: defaults.disableWebSecurity,
			initialOpenGlRenderer: defaults.openGlRenderer as OpenGlRenderer | null,
			initialHeadless: defaults.headless,
			initialIgnoreCertificateErrors: defaults.ignoreCertificateErrors,
			initialOffthreadVideoCacheSizeInBytes:
				defaults.offthreadVideoCacheSizeInBytes,
			defaultProps: props[video.id] ?? video.defaultProps,
			inFrameMark: inFrame,
			outFrameMark: outFrame,
			initialColorSpace: defaults.colorSpace as ColorSpace,
			initialMultiProcessOnLinux: defaults.multiProcessOnLinux,
			defaultConfigurationVideoCodec: defaults.codec as Codec,
		});
	}, [video, setSelectedModal, frame, props, inFrame, outFrame]);

	if (!video) {
		return null;
	}

	return (
		<Button
			id="render-modal-button"
			title={tooltip}
			onClick={onClick}
			buttonContainerStyle={button}
			disabled={connectionStatus !== 'connected'}
		>
			<Row align="center">
				<RenderIcon svgProps={iconStyle} />
				<Spacing x={1} />
				<span style={label}>Render</span>
			</Row>
		</Button>
	);
};

import { WaitForMessage } from "../shared++/utils.js";
import { SteamWindow, SteamWindowOptions } from "./SteamWindow";

interface WindowDimensions {
	width: number;
	height: number;
	top: number;
	left: number;
}

const OptionsToString = (opts: any, char: string) =>
	Object.entries(opts)
		.map((e) => e.join("="))
		.join(char);

/**
 * Opens an empty window through SharedJSContext.
 *
 * @param options Steam-specific window features.
 * @param dimensions Window dimensions.
 */
export default async function CreateWindow(
	options?: Partial<SteamWindowOptions>,
	dimensions?: Partial<WindowDimensions>,
): Promise<SteamWindow> {
	const opener = window.opener || window;

	opener.__OpenedWindow = opener.window.open(
		`about:blank?${OptionsToString(options, "&")}`,
		undefined,
		OptionsToString(
			Object.assign(dimensions, {
				status: false,
				toolbar: false,
				menubar: false,
				location: false,
			}),
			",",
		),
	);

	const wnd = opener.__OpenedWindow;
	await WaitForMessage("popup-created", wnd);

	return wnd
		? wnd
		: new Error(
				`Failed to create popup, browser/CEF may be blocking popups for "${window.location.origin}"`,
		  );
}

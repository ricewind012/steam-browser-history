import type { SteamWindow, SteamWindowOptions } from "./steamwindowdefs";

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
export async function CreateWindow(
	options?: Partial<SteamWindowOptions>,
	dimensions?: Partial<WindowDimensions>,
): Promise<SteamWindow> {
	const wnd = window.open(
		`about:blank?${OptionsToString(options, "&")}`,
		undefined,
		OptionsToString(
			{
				...dimensions,
				status: false,
				toolbar: false,
				menubar: false,
				location: false,
			},
			",",
		),
	) as SteamWindow;
	if (!wnd) {
		new Error(
			`Failed to create popup, browser/CEF may be blocking popups for "${window.location.origin}"`,
		);
	}

	await WaitForMessage("popup-created", wnd);
	return wnd;
}

export const WaitForMessage = async (msg: string, wnd: SteamWindow = window) =>
	new Promise<void>((resolve) => {
		function OnMessage(ev: MessageEvent) {
			if ((ev.data.message || ev.data) !== msg) {
				return;
			}

			resolve();
			wnd.removeEventListener("message", OnMessage);
		}

		wnd.addEventListener("message", OnMessage);
	});

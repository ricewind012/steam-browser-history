import {
	findModule,
	Menu,
	MenuItem,
	Millennium,
	showContextMenu,
} from "@steambrew/client";
import type * as globals from "./sharedjscontextglobals";

declare const g_PopupManager: globals.PopupManager;
declare const MainWindowBrowserManager: globals.MainWindowBrowserManager;

const MAIN_WINDOW_NAME = "SP Desktop_uid0";

const WaitForElement = async (sel: string, parent = document) =>
	[...(await Millennium.findElement(parent, sel))][0];

async function OnPopupCreation(popup: globals.SteamPopup) {
	if (popup.m_strName !== MAIN_WINDOW_NAME) {
		return;
	}

	const classes = {
		steamdesktop: findModule((e) => e.FocusBar),
	};
	const urlBar = await WaitForElement(
		`.${classes.steamdesktop.URLBarText}`,
		popup.m_popup.document
	);

	let entries: string[] = [];
	MainWindowBrowserManager.m_browser.on("start-request", (url) => {
		if (url.startsWith("data")) {
			return;
		}
		if (entries.includes(url)) {
			return;
		}

		entries.unshift(url);
	});

	urlBar.addEventListener("click", () => {
		showContextMenu(
			<Menu label="History">
				{entries.map((e) => (
					<MenuItem
						onClick={() => {
							MainWindowBrowserManager.ShowURL(e);
						}}
					>
						{e}
					</MenuItem>
				))}
			</Menu>,
			urlBar,
			// @ts-ignore
			{
				bForcePopup: true,
				bOverlapHorizontal: true,
			}
		);
	});
}

export default async function PluginMain() {
	const wnd = g_PopupManager.GetExistingPopup(MAIN_WINDOW_NAME);
	if (wnd) {
		OnPopupCreation(wnd);
	}
	g_PopupManager.AddPopupCreatedCallback(OnPopupCreation);
}

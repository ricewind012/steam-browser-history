import { CreateWindow } from "./windowutils";
import type * as globals from "./sharedjscontextglobals";
import { EBrowserType, EPopupCreationFlags } from "./steamwindowdefs";
import { DesktopMenuItem } from "./contextmenu";

import { findModule, Millennium } from "@steambrew/client";
import * as ReactDOM from "react-dom";

declare const g_PopupManager: globals.PopupManager;
declare const MainWindowBrowserManager: globals.MainWindowBrowserManager;

const MAIN_WINDOW_NAME = "SP Desktop_uid0";

async function OnPopupCreation(popup: globals.SteamPopup) {
	if (popup.m_strName !== MAIN_WINDOW_NAME) {
		return;
	}

	const classes = {
		contextmenu: findModule((e) => e.ContextMenuFocusContainer),
		menu: findModule((e) => e.MenuWrapper),
		steamdesktop: findModule((e) => e.FocusBar),
		supernav: findModule((e) => e.SuperNav),
	};
	const urlBar = [
		...(await Millennium.findElement(
			popup.m_popup.document,
			`.${classes.steamdesktop.URLBarText}`,
		)),
	][0];
	const wnd = await CreateWindow({
		browserType: EBrowserType.DirectHWND_Borderless,
		createflags:
			EPopupCreationFlags.Hidden | EPopupCreationFlags.NoRoundedCorners,
	});

	wnd.document.write(`
		<div id="popup_target">
			<div
				class="
					visible
					${classes.contextmenu.contextMenu}
					${classes.contextmenu.ContextMenuFocusContainer}
				"
				tabindex="0"
				style="visibility: visible"
			>
				<div
					id="menu"
					class="
						${classes.contextmenu.contextMenuContents}
						${classes.menu.MenuPopup}
						${classes.supernav.MenuPopup}
					"
				></div>
			</div>
		</div>
	`);

	wnd.document.head.innerHTML = popup.m_popup.document.head.innerHTML;
	wnd.document.documentElement.className = [
		classes.contextmenu.ContextMenuPopup,
		"client_chat_frame",
	].join(" ");
	wnd.document.body.className = "ContextMenuPopupBody DesktopUI";
	wnd.document.body.style.height = "fit-content";

	wnd.addEventListener("blur", () => {
		wnd.SteamClient.Window.HideWindow();
	});

	const container = wnd.document.getElementById("menu");
	MainWindowBrowserManager.m_browser.on("start-request", (url) => {
		if (url.startsWith("data")) {
			return;
		}

		const entries = MainWindowBrowserManager.m_history.entries
			.map((e) => e.state?.strURL)
			.filter(Boolean);
		if (entries.slice(0, -1).includes(url) || entries.length <= 1) {
			return;
		}

		const content = entries.reverse().map((e) => (
			<DesktopMenuItem
				key={e}
				onClick={() => {
					MainWindowBrowserManager.m_browser.LoadURL(e);
					wnd.SteamClient.Window.HideWindow();
				}}
			>
				{e}
			</DesktopMenuItem>
		));
		ReactDOM.render(content, container);
	});

	urlBar.addEventListener("click", () => {
		const { width, height } = container.getBoundingClientRect();
		const urlBarBounds = urlBar.getBoundingClientRect();

		wnd.SteamClient.Window.ShowWindow();
		wnd.SteamClient.Window.ResizeTo(width, height, true);
		wnd.SteamClient.Window.MoveTo(
			popup.m_popup.screenX + urlBarBounds.x,
			popup.m_popup.screenY + urlBarBounds.y + urlBarBounds.height,
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

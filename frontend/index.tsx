import { CreateWindow, WaitForMessage } from "./windowutils";
import type * as globals from "./sharedjscontextglobals";
import {
  EBrowserType,
  EPopupCreationFlags,
  type SteamWindow,
} from "./steamwindowdefs";

import { findModule, Millennium } from "millennium-lib";

declare const window: SteamWindow;

declare const SteamUIStore: globals.SteamUIStore;
declare const MainWindowBrowserManager: globals.MainWindowBrowserManager;

window.addEventListener("message", (ev) => {
  const msg = ev.data;
  if (msg.message !== "open-link") {
    return;
  }

  MainWindowBrowserManager.m_browser.LoadURL(msg.data);
});

export default async function PluginMain() {
  // Wait for the main window to be ready.
  await WaitForMessage("FriendsUIReady");

  const classes = {
    contextmenu: findModule((e) => e.ContextMenuFocusContainer),
    menu: findModule((e) => e.MenuWrapper),
    steamdesktop: findModule((e) => e.FocusBar),
    supernav: findModule((e) => e.SuperNav),
  };
  const mainWindow = SteamUIStore.WindowStore.SteamUIWindows[0].m_BrowserWindow;
  const urlBar = [
    ...(await Millennium.findElement(
      mainWindow.document,
      `.${classes.steamdesktop.URLBarText}`
    )),
  ][0];

  urlBar.addEventListener("click", async () => {
    const entries = MainWindowBrowserManager.m_history.entries
      .filter((e) => e.state?.strURL?.startsWith("http"))
      .map((e) => e.state.strURL)
      .reverse();
    if (entries.length <= 1) {
      return;
    }

    const urlBarBounds = urlBar.getBoundingClientRect();
    const wnd = await CreateWindow(
      {
        browserType: EBrowserType.DirectHWND_Borderless,
        createflags:
          EPopupCreationFlags.NoTaskbarIcon |
          EPopupCreationFlags.NoRoundedCorners |
          EPopupCreationFlags.NoWindowShadow,
      },
      {
        top: mainWindow.screenY + urlBarBounds.y + urlBarBounds.height,
        left: mainWindow.screenX + urlBarBounds.x,
      }
    );

    wnd.document.write(`
			<div id="popup_target">
				<div
					class="
						visible
						${classes.contextmenu.contextMenu}
						${classes.contextmenu.ContextMenuFocusContainer}
					"
					tabindex="0"
					style="visibility: visible; min-width: 162.078px"
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

			<script>
				window.addEventListener("message", (ev) => {
					const msg = ev.data;
					if (typeof msg != "object") {
						return;
					}

					const container = document.getElementById("menu");

					msg.forEach((link) => {
						let entry = document.createElement("div");

						entry.className = [
							"${classes.menu.MenuItem}",
							"${classes.contextmenu.contextMenuItem}",
							"contextMenuItem",
						].join(" ");
						entry.innerText = link;
						entry.addEventListener("click", () => {
							window.opener.postMessage({ message: "open-link", data: link });
							window.close();
						});

						container.appendChild(entry);
					});

					const { width, height } = container.getBoundingClientRect();
					SteamClient.Window.ResizeTo(width, height, true);
				});
			</script>
		`);

    wnd.document.head.innerHTML = mainWindow.document.head.innerHTML;
    wnd.document.documentElement.className = [
      classes.contextmenu.ContextMenuPopup,
      "client_chat_frame",
    ].join(" ");
    wnd.document.body.className = "ContextMenuPopupBody DesktopUI";
    wnd.document.body.style.height = "fit-content";

    wnd.postMessage(entries);

    wnd.addEventListener("blur", () => {
      wnd.close();
    });
  });
}

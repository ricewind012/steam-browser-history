import { CreateWindow, WaitForMessage } from "./windowutils";
import type * as globals from "./sharedjscontextglobals";
import { EBrowserType, EPopupCreationFlags } from "./steamwindowdefs";
import { DesktopMenuItem } from "./contextmenu";

import { findModule, Millennium } from "@millennium/ui";
import * as ReactDOM from "react-dom";

declare const SteamUIStore: globals.SteamUIStore;
declare const MainWindowBrowserManager: globals.MainWindowBrowserManager;

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

  wnd.document.head.innerHTML = mainWindow.document.head.innerHTML;
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
      mainWindow.screenX + urlBarBounds.x,
      mainWindow.screenY + urlBarBounds.y + urlBarBounds.height
    );
  });
}

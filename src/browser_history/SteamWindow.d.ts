export const enum EBrowserType {
	OffScreen,
	OpenVROverlay,
	OpenVROverlay_Dashboard,
	DirectHWND,
	DirectHWND_Borderless,
	DirectHWND_Hidden,
	ChildHWNDNative,
	Transparent_Toplevel,
	OffScreen_SharedTexture,
	OffScreen_GameOverlay,
	OffScreen_GameOverlay_SharedTexture,
	Offscreen_FriendsUI,
	Offscreen_SteamUI,
	OpenVROverlay_Subview,
}

export const enum EPopupCreationFlags {
	None,
	Minimized = 1 << 0,
	Hidden = 1 << 1,
	TooltipHint = 1 << 2,
	NoTaskbarIcon = 1 << 3,
	Resizable = 1 << 4,
	ScalePosition = 1 << 5,
	ScaleSize = 1 << 6,
	Maximized = 1 << 7,
	BackgroundTransparent = 1 << 8,
	NotFocusable = 1 << 9,
	FullScreen = 1 << 10,
	Fullscreen_Exclusive = 1 << 11,
	ApplyBrowserScaleToDimensions = 1 << 12,
	AlwaysOnTop = 1 << 13,
	NoWindowShadow = 1 << 14,
	NoMinimize = 1 << 15,
	PopUpMenuHint = 1 << 16,
	IgnoreSavedSize = 1 << 17,
	NoRoundedCorners = 1 << 18,
	ForceRoundedCorners = 1 << 19,
	OverrideRedirect = 1 << 20,
	IgnoreSteamDisplayScale = 1 << 21,
}

export interface SteamWindowOptions {
	/** `m_nBrowserID` in browser context */
	browser: number;
	browserType: EBrowserType;
	/** `SteamClient.Browser.GetBrowserID()` */
	centerOnBrowserID: number;
	/** Used with {@link EPopupCreationFlags} */
	createflags: number;
	/** @todo Doesn't work */
	height: number;
	hwndParent: number;
	/** @todo Doesn't work */
	left: number;
	minheight: number;
	minwidth: number;
	modal: boolean;
	/** `SteamClient.Browser.GetBrowserID()` */
	openerid: number;
	/** `SteamClient.Browser.GetBrowserID()` */
	parentcontainerpopupid: number;
	/** `m_unPID` in browser context */
	pid: number;
	pinned: boolean;
	restoredetails: string;
	screenavailwidth: number;
	screenavailheight: number;
	/** @todo Doesn't work */
	top: number;
	useragent: string;
	vrOverlayKey: string;
	/** @todo Doesn't work */
	width: number;
}

export interface SteamWindow extends Window {
	SteamClient: any;
}

interface SteamBrowserHistoryEntry {
	hash: string;
	key: string;
	pathname: string;
	search: string;

	/**
	 * Present if `pathname` is `/browser/`.
	 */
	state?: {
		/**
		 * `true` if called from Steam.
		 */
		bExternal: boolean;
		/**
		 * Entry URL.
		 */
		strURL: string;
	};
}

export interface SteamPopup {
	/**
	 * Root element.
	 */
	m_element: HTMLElement;
	m_popup: Window;
	/**
	 * Popup (internal) name.
	 */
	m_strName: string;
}

export interface MainWindowBrowserManager {
	ShowURL(url: string): void;

	/** BrowserViewPopup */
	m_browser: {
		on(event: "start-request", callback: (url: string) => void): void;
	};

	/** Browser history. */
	m_history: {
		action: "POP" | "PUSH";
		canGo(index: number): boolean;
		createHref(entry: SteamBrowserHistoryEntry): string;
		entries: SteamBrowserHistoryEntry[];

		/** `entries` length. */
		length: number;
	};

	/** Current location. */
	location: SteamBrowserHistoryEntry;
}

export interface PopupManager {
	/**
	 * Adds a callback to dispatch on popup creation.
	 */
	AddPopupCreatedCallback(callback: (popup: SteamPopup) => void): void;

	/**
	 * @returns the popup for the specified popup name.
	 */
	GetExistingPopup(popupName: string): SteamPopup | undefined;
}

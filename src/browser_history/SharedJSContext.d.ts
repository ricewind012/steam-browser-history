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

declare var MainWindowBrowserManager: {
	/** BrowserViewPopup */
	m_browser: any;

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
};

declare var SteamUIStore: {
	WindowStore: {
		SteamUIWindows: {
			/** Steam window's {@link Window}. */
			m_BrowserWindow: Window;
		}[];
	};
};

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

export interface MainWindowBrowserManager {
	/** BrowserViewPopup */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
}

export interface SteamUIStore {
	WindowStore: {
		SteamUIWindows: {
			/** Steam window's {@link Window}. */
			m_BrowserWindow: Window;
		}[];
	};
}

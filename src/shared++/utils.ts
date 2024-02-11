export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const WaitForMessage = async (msg: string, wnd = window) =>
	new Promise<void>((resolve) => {
		function OnMessage(ev: MessageEvent) {
			if ((ev.data.message || ev.data) != msg) {
				return;
			}

			resolve();
			wnd.removeEventListener("message", this);
		}

		wnd.addEventListener("message", OnMessage);
	});

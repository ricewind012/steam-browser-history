export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const WaitForMessage = async (msg, wnd = window) => new Promise((resolve) => {
    function OnMessage(ev) {
        if ((ev.data.message || ev.data) != msg) {
            return;
        }
        resolve();
        wnd.removeEventListener("message", this);
    }
    wnd.addEventListener("message", OnMessage);
});

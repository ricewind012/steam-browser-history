import { WaitForMessage } from "../shared++/utils.js";
const OptionsToString = (opts, char) => Object.entries(opts)
    .map((e) => e.join("="))
    .join(char);
/**
 * Opens an empty window through SharedJSContext.
 *
 * @param options Steam-specific window features.
 * @param dimensions Window dimensions.
 */
export default async function CreateWindow(options, dimensions) {
    const opener = window.opener || window;
    opener.__OpenedWindow = opener.window.open(`about:blank?${OptionsToString(options, "&")}`, undefined, OptionsToString(Object.assign(dimensions, {
        status: false,
        toolbar: false,
        menubar: false,
        location: false,
    }), ","));
    const wnd = opener.__OpenedWindow;
    await WaitForMessage("popup-created", wnd);
    return wnd
        ? wnd
        : new Error(`Failed to create popup, browser/CEF may be blocking popups for "${window.location.origin}"`);
}

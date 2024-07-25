import { findModuleExport } from "@millennium/ui";

interface DesktopMenuItemProps {
	children?: React.ReactNode;
	disabled?: boolean;
	onClick?: (e: PointerEvent) => void;
}

export const DesktopMenuItem: React.FC<DesktopMenuItemProps> = findModuleExport(
	(m) => m.displayName === "MenuItem",
);

import AccessibilitySidebar from "./AccessibilitySidebar/AccessibilitySidebar";
import ExtractSidebar from "./ExtractSidebar/ExtractSidebar";
import MethodSidebar from "./MethodSidebar/MethodSidebar";
import { SIDEBAR_ORDER, SidebarPanel } from "./SidebarContext";

export default function SidebarMap() {
  return SIDEBAR_ORDER.map((panel) => {
    switch (panel) {
      case SidebarPanel.EXTRACT:
        return <ExtractSidebar key={panel} />;
      case SidebarPanel.METHOD:
        return <MethodSidebar key={panel} />;
      case SidebarPanel.ACCESSIBILITY:
        return <AccessibilitySidebar key={panel} />;
      default:
        return null;
    }
  });
}

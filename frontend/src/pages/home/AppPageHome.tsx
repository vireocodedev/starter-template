import { CheckCircleOutlined, Inventory2Outlined, OfflineBoltOutlined } from "@mui/icons-material";
import { AppPageHomeView } from "./AppPageHomeView";

export function AppPageHome() {
  return <AppPageHomeView icons={[<Inventory2Outlined />, <CheckCircleOutlined />, <OfflineBoltOutlined />]} />;
}

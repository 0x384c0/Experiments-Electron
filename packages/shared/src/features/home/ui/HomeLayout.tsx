import { useMemo } from "react";
import { AppBar, Box, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export interface HomeTab {
  label: string;
  path: string;
}

export function HomeLayout({ tabs }: { tabs: HomeTab[] }) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(
    () => tabs.find((tab) => location.pathname.startsWith(tab.path))?.path ?? false,
    [tabs, location.pathname],
  );

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Experiments Electron</Typography>
        </Toolbar>
        <Tabs value={activeTab} onChange={(_, path: string) => navigate(path)} textColor="inherit">
          {tabs.map((tab) => (
            <Tab key={tab.path} label={tab.label} value={tab.path} />
          ))}
        </Tabs>
      </AppBar>
      <Outlet />
    </Box>
  );
}

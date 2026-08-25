import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { PageOverlayOutlet, VireoPage, VireoPageBody } from "@vireocodedev/starter-ui";
import { useAppPreferences } from "@/app/ui/preferences/hooks/useAppPreferences";

export type AppPageLayoutProps = React.PropsWithChildren<{
  header?: React.ReactNode;
  paddingOnCompact?: boolean;
  scrollMode?: "page" | "contained";
}>;

export function AppPageLayout({ children, header, paddingOnCompact = true, scrollMode = "page" }: AppPageLayoutProps) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("sm"));
  const { preferences } = useAppPreferences();
  const maxWidth = preferences.pageWidth === "full" ? false : preferences.pageWidth;
  const docked = desktop && preferences.desktopSurface === "dockedSidePanel";
  const overlayOutlet = <PageOverlayOutlet />;

  return (
    <VireoPage measureParent sx={{ bgcolor: "surface.sunken", flex: 1, height: "100%", minHeight: 0, minWidth: 0 }}>
      {header}
      <VireoPageBody
        drawer={docked ? overlayOutlet : undefined}
        maxWidth={maxWidth}
        paddingOnCompact={paddingOnCompact}
        slotProps={
          scrollMode === "contained"
            ? {
                content: { sx: { minHeight: 0, overflow: "hidden" } },
                container: {
                  sx: {
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    overflow: "hidden",
                  },
                },
              }
            : undefined
        }
      >
        {children}
      </VireoPageBody>
      {!docked && overlayOutlet}
    </VireoPage>
  );
}

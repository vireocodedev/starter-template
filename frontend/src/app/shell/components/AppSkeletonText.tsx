import type React from "react";
import { Box } from "@mui/material";
import { VireoSkeleton } from "@vireocodedev/ui";

export type AppSkeletonTextProps = {
  children: React.ReactNode;
  visible?: boolean;
};

/**
 * Preserves the wrapped content's real typography and wrapping geometry while
 * presenting it as a loading placeholder.
 */
export function AppSkeletonText({ children, visible = true }: AppSkeletonTextProps) {
  return (
    <>
      <Box
        component="span"
        sx={{
          border: "none",
          clip: "rect(0 0 0 0)",
          height: 1,
          m: -1,
          overflow: "hidden",
          p: 0,
          position: "absolute",
          whiteSpace: "nowrap",
          width: 1,
        }}
      >
        {children}
      </Box>
      <VireoSkeleton
        data-app-skeleton-text
        variant="rounded"
        sx={{
          boxDecorationBreak: "clone",
          display: "inline",
          lineHeight: "inherit",
          maskImage: "linear-gradient(to bottom, transparent 12%, black 12%, black 88%, transparent 88%)",
          maxWidth: "100%",
          transform: "none",
          visibility: visible ? "visible" : "hidden",
          WebkitBoxDecorationBreak: "clone",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 12%, black 12%, black 88%, transparent 88%)",
          "& > *": { visibility: "hidden" },
        }}
      >
        <Box component="span">{children}</Box>
      </VireoSkeleton>
    </>
  );
}

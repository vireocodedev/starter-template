import type React from "react";
import { Box, Skeleton } from "@mui/material";

export type AppSkeletonTextProps = {
  children: React.ReactNode;
};

/**
 * Preserves the wrapped content's real typography and wrapping geometry while
 * presenting it as a loading placeholder.
 */
export function AppSkeletonText({ children }: AppSkeletonTextProps) {
  return (
    <>
      <Box
        component="span"
        sx={{
          border: 0,
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
      <Skeleton
        aria-hidden
        component="span"
        variant="rounded"
        sx={{
          display: "block",
          maxWidth: "100%",
          transform: "none",
          width: "fit-content",
          "& > *": { visibility: "hidden" },
        }}
      >
        <Box component="span" sx={{ display: "block" }}>
          {children}
        </Box>
      </Skeleton>
    </>
  );
}

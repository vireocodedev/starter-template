import { Box } from "@mui/material";
import type { Breakpoint, CSSObject, Theme } from "@mui/material/styles";
import type React from "react";

type VireoContainerGridResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

type VireoContainerGridBaseProps = {
  children: React.ReactNode;
};

export type VireoContainerGridContainerProps = VireoContainerGridBaseProps & {
  /** Makes this grid a container for its direct grid-item children. */
  container: true;
  /** Number of columns available at each container-width breakpoint. @default 12 */
  columns?: VireoContainerGridResponsiveValue<number>;
  /** Optional size when this container is itself nested inside another container grid. */
  size?: VireoContainerGridResponsiveValue<number>;
  /** Gap between rows and columns, expressed using theme spacing. @default 0 */
  spacing?: VireoContainerGridResponsiveValue<number>;
};

export type VireoContainerGridItemProps = VireoContainerGridBaseProps & {
  columns?: never;
  container?: false;
  /** Number of parent columns occupied at each container-width breakpoint. */
  size: VireoContainerGridResponsiveValue<number>;
  spacing?: never;
};

export type VireoContainerGridProps = VireoContainerGridContainerProps | VireoContainerGridItemProps;

function createResponsiveStyles(
  theme: Theme,
  value: VireoContainerGridResponsiveValue<number>,
  createStyles: (responsiveValue: number) => CSSObject,
): CSSObject {
  if (typeof value === "number") return createStyles(value);

  const styles: CSSObject = {};
  const firstBreakpoint = theme.breakpoints.keys[0];

  for (const breakpoint of theme.breakpoints.keys) {
    const responsiveValue = (value as Partial<Record<Breakpoint, number>>)[breakpoint];
    if (responsiveValue === undefined) continue;

    const breakpointStyles = createStyles(responsiveValue);
    if (breakpoint === firstBreakpoint) {
      Object.assign(styles, breakpointStyles);
    } else {
      styles[theme.containerQueries.up(breakpoint)] = breakpointStyles;
    }
  }

  return styles;
}

function createItemStyles(theme: Theme, size: VireoContainerGridResponsiveValue<number> | undefined): CSSObject {
  if (size === undefined) return {};
  return createResponsiveStyles(theme, size, value => ({ gridColumn: `span ${value}` }));
}

/**
 * A small Grid-compatible layout primitive whose responsive values measure the
 * nearest container grid instead of the browser viewport.
 */
export function VireoContainerGrid(props: VireoContainerGridProps) {
  if (!props.container) {
    return (
      <Box
        sx={theme => ({
          minWidth: 0,
          ...createItemStyles(theme, props.size),
        })}
      >
        {props.children}
      </Box>
    );
  }

  const { children, columns = 12, size, spacing = 0 } = props;

  return (
    <Box
      sx={theme => ({
        containerType: "inline-size",
        minWidth: 0,
        ...createItemStyles(theme, size),
      })}
    >
      <Box
        sx={theme => ({
          display: "grid",
          gap: theme.spacing(0),
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          minWidth: 0,
          ...createResponsiveStyles(theme, columns, value => ({
            gridTemplateColumns: `repeat(${value}, minmax(0, 1fr))`,
          })),
          ...createResponsiveStyles(theme, spacing, value => ({ gap: theme.spacing(value) })),
        })}
      >
        {children}
      </Box>
    </Box>
  );
}

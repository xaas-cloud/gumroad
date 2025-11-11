import * as React from "react";

import { classNames } from "$app/utils/classNames";

export type Position = "top" | "left" | "bottom" | "right";

type Props = {
  children: React.ReactNode;
  tip: React.ReactNode | null;
  position?: Position | undefined;
  tooltipProps?: React.HTMLAttributes<HTMLSpanElement> | undefined;
} & React.HTMLAttributes<HTMLSpanElement>;
export const WithTooltip = ({ tip, children, position = "bottom", className, tooltipProps, ...props }: Props) => {
  const id = React.useId();

  return (
    <span {...props} className={classNames("group relative inline-grid", className, position)}>
      <span aria-describedby={id} style={{ display: "contents" }}>
        {children}
      </span>
      {tip ? (
        <span
          role="tooltip"
          id={id}
          {...tooltipProps}
          className={classNames(
            "absolute z-30 hidden w-40 max-w-max rounded-md bg-primary p-3 text-primary-foreground group-hover:block",
            {
              "bottom-full left-1/2 -translate-x-1/2 -translate-y-2": position === "top",
              "top-1/2 right-full -translate-x-2 -translate-y-1/2": position === "left",
              "top-full left-1/2 -translate-x-1/2 translate-y-2": position === "bottom",
              "top-1/2 left-full translate-x-2 -translate-y-1/2": position === "right",
            },
            tooltipProps?.className,
          )}
        >
          <div
            className={classNames("absolute border-6 border-transparent", {
              "top-full left-1/2 -translate-x-1/2 border-t-primary": position === "top",
              "top-1/2 left-full -translate-y-1/2 border-l-primary": position === "left",
              "bottom-full left-1/2 -translate-x-1/2 border-b-primary": position === "bottom",
              "top-1/2 right-full -translate-y-1/2 border-r-primary": position === "right",
            })}
          ></div>
          {tip}
        </span>
      ) : null}
    </span>
  );
};

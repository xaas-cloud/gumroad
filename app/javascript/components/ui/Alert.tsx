import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { classNames } from "$app/utils/classNames";

import { Icon } from "$app/components/Icons";

const alertVariants = cva(
  "tailwind-override grid grid-cols-[auto_1fr] items-start gap-2 rounded border p-3 md:grid-cols-[auto_1fr_auto]",
  {
    variants: {
      color: {
        success: "border-success bg-success/20 text-success-foreground",
        danger: "border-danger bg-danger/20 text-danger-foreground",
        warning: "border-warning bg-warning/20 text-warning-foreground",
        info: "border-info bg-info/20 text-info-foreground",
      },
    },
    defaultVariants: {
      color: "info",
    },
  },
);

const iconNames = {
  success: "solid-check-circle",
  danger: "x-circle-fill",
  warning: "solid-shield-exclamation",
  info: "info-circle-fill",
} as const;

const iconColors = {
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  info: "text-info",
} as const;

export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants> & {
      action?: React.ReactNode;
    }
>(({ className, color = "info", action, children, ...props }, ref) => (
  <div ref={ref} role="alert" className={classNames(alertVariants({ color }), className)} {...props}>
    <Icon name={iconNames[color]} className={classNames("size-[1lh]!", iconColors[color])} />
    <div>{children}</div>
    {action ? <div className="col-2 sm:col-3">{action}</div> : null}
  </div>
));
Alert.displayName = "Alert";

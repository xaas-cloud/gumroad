import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { classNames } from "$app/utils/classNames";

import { ButtonProps, buttonVariants } from "$app/components/Button";
import { Position, WithTooltip } from "$app/components/WithTooltip";

export const Popover = PopoverPrimitive.Root;

export const PopoverClose = PopoverPrimitive.Close;

export const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> & {
    tooltip?: string | undefined;
    tooltipPosition?: Position;
  }
>(({ className, tooltip, tooltipPosition, ...props }, ref) => {
  const content = (
    <PopoverPrimitive.Trigger
      ref={ref}
      className={classNames("outline-none focus-visible:outline-none", className)}
      {...props}
    />
  );

  if (tooltip) {
    return (
      <WithTooltip position={tooltipPosition} tip={tooltip}>
        {content}
      </WithTooltip>
    );
  }

  return content;
});
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

export const PopoverTriggerButton = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> & {
    tooltip?: string | undefined;
    tooltipPosition?: Position;
    color?: ButtonProps["color"];
    size?: "sm" | "default";
    variant?: "default" | "outline" | "secondary" | "destructive";
  }
>(({ children, color, size, variant, ...props }, ref) => (
  <PopoverTrigger ref={ref} {...props}>
    <div className={buttonVariants({ color, size, variant })}>{children}</div>
  </PopoverTrigger>
));
PopoverTriggerButton.displayName = "PopoverTriggerButton";

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    matchTriggerWidth?: boolean;
    arrowClassName?: string;
    usePortal?: boolean;
  }
>(
  (
    {
      children,
      className,
      arrowClassName,
      align = "start",
      collisionPadding = 16,
      matchTriggerWidth = false,
      usePortal = false,
      ...props
    },
    ref,
  ) => {
    const content = (
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        collisionPadding={collisionPadding}
        autoFocus={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className={classNames(
          "z-30 w-max max-w-[calc(100vw-2rem)] rounded-sm border border-border bg-background p-4 text-foreground shadow outline-none focus-visible:outline-none",
          { "w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)]": matchTriggerWidth },
          className,
        )}
        {...props}
      >
        {children}
        <PopoverPrimitive.Arrow
          width={16}
          height={8}
          className={classNames("fill-black dark:fill-foreground/35", arrowClassName)}
        />
      </PopoverPrimitive.Content>
    );

    return usePortal ? <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal> : content;
  },
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

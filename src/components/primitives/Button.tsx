import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "../../lib/cn";
import { track } from "../../lib/analytics";
import type { ButtonSize, ButtonVariant } from "../../types/design-system";
import type { EmptyAnalyticsEventName } from "../../lib/analytics";

type SharedButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  analyticsEvent?: EmptyAnalyticsEventName;
};

type LinkButtonProps = SharedButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type NativeButtonProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

function isLinkButtonProps(
  props: LinkButtonProps | NativeButtonProps,
): props is LinkButtonProps {
  return typeof props.href === "string";
}

function getButtonClassName({
  className,
  size = "md",
  variant = "primary",
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return cn(
    "button",
    `button--${variant}`,
    `button--${size}`,
    className,
  );
}

function trackButtonClick(analyticsEvent?: EmptyAnalyticsEventName) {
  if (analyticsEvent) {
    track(analyticsEvent);
  }
}

export function Button(props: LinkButtonProps | NativeButtonProps) {
  if (isLinkButtonProps(props)) {
    const {
      analyticsEvent,
      children,
      className,
      onClick,
      size,
      variant,
      ...anchorProps
    } = props;

    return (
      <a
        className={getButtonClassName({ className, size, variant })}
        onClick={(event) => {
          trackButtonClick(analyticsEvent);
          onClick?.(event);
        }}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  const {
    analyticsEvent,
    children,
    className,
    onClick,
    size,
    variant,
    ...buttonProps
  } = props;

  return (
    <button
      className={getButtonClassName({ className, size, variant })}
      onClick={(event) => {
        trackButtonClick(analyticsEvent);
        onClick?.(event);
      }}
      {...buttonProps}
    >
      {children}
    </button>
  );
}

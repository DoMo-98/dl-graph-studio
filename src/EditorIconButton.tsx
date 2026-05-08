import { cloneElement, forwardRef, isValidElement } from "react";
import type {
  AriaAttributes,
  ButtonHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";

type EditorIconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label"
> & {
  icon: ReactNode;
  label: string;
};

export const EditorIconButton = forwardRef<
  HTMLButtonElement,
  EditorIconButtonProps
>(function EditorIconButton(
  { className, icon, label, title = label, type = "button", ...buttonProps },
  ref,
) {
  const buttonClassName = className
    ? `editor-icon-button ${className}`
    : "editor-icon-button";
  const renderedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<AriaAttributes>, {
        "aria-hidden": true,
      })
    : icon;

  return (
    <button
      {...buttonProps}
      ref={ref}
      type={type}
      className={buttonClassName}
      aria-label={label}
      title={title}
    >
      {renderedIcon}
    </button>
  );
});

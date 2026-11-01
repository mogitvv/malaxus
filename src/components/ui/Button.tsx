import type { ButtonHTMLAttributes, JSX } from "react";

type Variant = "neutral" | "green" | "red" | "gold" | "blue";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  neutral: "",
  green: "btn-mc-green",
  red: "btn-mc-red",
  gold: "btn-mc-gold",
  blue: "btn-mc-blue",
};

/** Knopf im Stil der Minecraft-Menüs: abgeschrägter 3D-Rand, Press-Down-Effekt. */
export function Button({ variant = "neutral", className = "", children, ...rest }: ButtonProps): JSX.Element {
  return (
    <button className={`btn-mc ${variantClass[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

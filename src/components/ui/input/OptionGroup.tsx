import { BemBuilder } from "@/lib/BemBuilder";
import styles from "./OptionGroup.module.scss";

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "list" | "pills";
};

const bem = new BemBuilder("option-group", styles);

export default function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  variant = "list",
}: Props<T>) {
  return (
    <div className={bem.block()}>
      <p className={bem.element("label")}>{label}</p>
      <div className={bem.element("options", variant)}>
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={opt.value}
              className={bem.element("option", isActive && "active")}
              onClick={() => onChange(opt.value)}
            >
              <div className={bem.element("option-content")}>
                <span className={bem.element("option-label")}>{opt.label}</span>
                {opt.description && (
                  <span className={bem.element("option-description")}>
                    {opt.description}
                  </span>
                )}
              </div>
              {isActive && variant === "list" && (
                <span className={bem.element("option-dot")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

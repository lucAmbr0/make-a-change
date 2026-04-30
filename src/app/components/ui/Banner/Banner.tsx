import type { ReactNode } from "react";
import styles from "./Banner.module.css";

interface BannerProps {
    primaryLabel: ReactNode;
    secondaryLabel?: ReactNode;
    actions?: ReactNode;
    className?: string;
    primaryClassName?: string;
    secondaryClassName?: string;
    actionsClassName?: string;
}

export default function Banner({
    primaryLabel,
    secondaryLabel,
    actions,
    className,
    primaryClassName,
    secondaryClassName,
    actionsClassName,
}: BannerProps) {
    return (
        <div className={`${styles.banner} ${className ?? ""}`}>
            <div className={styles.labels}>
                <span className={`${styles.primaryLabel} ${primaryClassName ?? ""}`}>
                    {primaryLabel}
                </span>
                {secondaryLabel ? (
                    <span className={`${styles.secondaryLabel} ${secondaryClassName ?? ""}`}>
                        {secondaryLabel}
                    </span>
                ) : null}
            </div>
            <span className={styles.spacer} />
            {actions ? (
                <div className={`${styles.actions} ${actionsClassName ?? ""}`}>
                    {actions}
                </div>
            ) : null}
        </div>
    );
}

import React from "react";
import styles from "./StatsBox.module.css"

export default function StatsBox({ stats, showBackground = false }: { stats: { label: string; value: string | number }[], showBackground?: boolean }) {
    return <>
        <div
            className={`${styles.container} ${showBackground ? styles.containerBackground : ""}`}
            style={{ "--stats-columns": stats.length } as React.CSSProperties}
        >
            {stats.map((stat) => (<div key={stat.label} className={styles.statsItem}>
                <p className={styles.statsValue}>{stat.value}</p>
                <p className={styles.statsLabel}>{stat.label}</p>
            </div>
            ))}
        </div>
    </>
}
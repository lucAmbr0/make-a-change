import styles from "./ProgressBar.module.css";

export default function ProgressBar({total, current, showLabel = false, unit = ""}: {total: number, current: number, showLabel?: boolean, unit?: string}) {
    const percentage = (current / total) * 100;
    return <>
        {showLabel && <p className={styles.textLabel}>{current} / {total} {unit}</p>}
        <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${percentage}%` }}></div>
        </div>
    </>
}
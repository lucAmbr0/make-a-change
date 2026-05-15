import styles from "./NumberText.module.css"

export default function NumberText({ number, text, final = false }: { number: number, text: string, final?: boolean }) {
    return <>
        <div className={styles.container}>
            <div className={`${styles.numberContainer} ${final ? styles.numberContainerFinal : ''}`}>
                <p className={`${styles.number} ${final ? styles.numberFinal : ''}`}>{number}</p>
            </div>
            <p className={`${styles.text} ${final ? styles.textFinal : ''}`}>{text}</p>
        </div>
    </>
}
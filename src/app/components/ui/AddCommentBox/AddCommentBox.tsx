import { Icon } from '@iconify/react'
import styles from './AddCommentBox.module.css'

export default function AddCommentBox() {
    return <>
        <div className={styles.container}>
            <textarea required placeholder='Aggiungi un commento' maxLength={512} className={styles.input} />
            <button className={styles.button}><Icon icon={"material-symbols:send-outline"} className={styles.icon} fontSize={32} width={32} height={32} /></button>
        </div>
    </>
}
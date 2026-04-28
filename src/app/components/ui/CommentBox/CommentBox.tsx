import styles from "./CommentBox.module.css"

export default function CommentBox({ authorName = "Anonimo", commentText }: { authorName: string, commentText: string }) {
    return <>
        <div className={styles.container}>
            <h4 className={styles.authorName}>{authorName || "Anonimo"}</h4>
            <p className={styles.commentText}>{commentText || "Commento vuoto"}</p>
        </div>
    </>
}
import styles from "./Title.module.css";

export default function Title({text, hierarchy, alignment}: {text: string, hierarchy?: 1 | 2 | 3, alignment?: 'left' | 'center' | 'right'}) {
    const level = hierarchy || 1;
    const textAlign = alignment || 'left';
    const classes = `${styles.title} h${level} ${textAlign}`;

    if (level === 2) {
        return <h2 className={classes}>{text}</h2>
    }

    if (level === 3) {
        return <h3 className={classes}>{text}</h3>
    }

    return <h1 className={classes}>{text}</h1>
}
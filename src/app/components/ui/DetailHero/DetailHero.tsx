import styles from './DetailHero.module.css';

export default function DetailHero({
    imageSrc,
    imageAlt = "Immagine",
    children,
}: {
    imageSrc: string;
    imageAlt?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img className={styles.image} src={imageSrc} alt={imageAlt} />
            </div>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}

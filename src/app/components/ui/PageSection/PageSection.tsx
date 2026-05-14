import styles from './PageSection.module.css';

export default function PageSection({
    children,
    className,
    id,
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    return (
        <div id={id} className={`${styles.section}${className ? ` ${className}` : ''}`}>
            {children}
        </div>
    );
}

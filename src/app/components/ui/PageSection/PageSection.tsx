import styles from './PageSection.module.css';

export default function PageSection({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`${styles.section}${className ? ` ${className}` : ''}`}>
            {children}
        </div>
    );
}

import Link from 'next/link';
import styles from './Button.module.css';
import { Icon } from '@iconify/react';

export default function Button({
    onClick,
    href,
    text = "",
    icon = "",
    iconAlign = "left",
    type = "filled",
    textSize = 24,
}: {
    onClick?: () => void;
    href?: string;
    text?: string;
    icon?: string;
    type?: "filled" | "outlined" | "text";
    textSize?: number;
    iconAlign?: "left" | "right";
}) {

    const iconOnly = Boolean(icon) && !text;
    const typeClass = type === "filled" ? styles.filled : type === "outlined" ? styles.outlined : styles.text;
    const buttonClass = `${styles.button} ${typeClass} ${iconOnly ? styles.iconOnly : ""}`;
    const iconClass = iconAlign === "left" ? styles.iconLeft : styles.iconRight;
    const iconName = icon.includes(":") ? icon : `material-symbols:${icon}-outline`;

    const content = <>
        {icon && iconAlign === "left" && <Icon className={iconOnly ? "" : iconClass} fontSize={textSize} icon={iconName} />}
        {text && <span style={{ fontSize: textSize + "px" }}>{text}</span>}
        {icon && iconAlign === "right" && <Icon className={iconOnly ? "" : iconClass} fontSize={textSize} icon={iconName} />}
    </>;

    if (href) {
        return <Link href={href} className={buttonClass}>{content}</Link>;
    }

    return <button className={buttonClass} onClick={onClick}>{content}</button>;
}

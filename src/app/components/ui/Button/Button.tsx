import styles from './Button.module.css';
import { Icon } from '@iconify/react';

export default function Button({onClick, text = "", icon = "", iconAlign = "left", type = "filled", textSize = 24}: {onClick?: () => void, text?: string, icon?: string, type?: "filled" | "outlined" | "text", textSize?: number, iconAlign?: "left" | "right"}) {

    const buttonClass = `${styles.button} ${type === "filled" ? styles.filled : type === "outlined" ? styles.outlined : styles.text} ${icon ? styles.withIcon : ""} ${iconAlign === "right" ? styles.iconRight : ""}`;
    const iconClass = iconAlign === "left" ? styles.iconLeft : styles.iconRight;
    
    return <button className={buttonClass} onClick={onClick}>
        {icon && iconAlign === "left" && <Icon className={iconClass} fontSize={textSize} icon={"material-symbols:" + icon + "-outline"} />}
        {text && <span style={{fontSize: textSize + "px"}}>{text}</span>}
        {icon && iconAlign === "right" && <Icon className={styles.icon} icon={"material-symbols:" + icon + "-outline"} />}
    </button>
}
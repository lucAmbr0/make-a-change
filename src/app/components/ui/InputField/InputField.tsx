import styles from './InputField.module.css'

export default function InputField({
    type,
    required,
    checked,
    disabled,
    title,
    defaultValue,
    minLength,
    maxLength,
    min,
    max,
    placeholder,
    label,
}: {
    type?: "text" | "email" | "number" | "checkbox" | "password" | "date",
    required?: boolean,
    checked?: boolean,
    disabled?: boolean,
    title: string,
    defaultValue?: string,
    minLength?: number,
    maxLength?: number,
    min?: number,
    max?: number,
    placeholder?: string
    label?: string
}) {
    const labelEl = <label htmlFor={title} className={styles.label}>{label}</label>;
    let inputEl;
    switch (type) {
        case 'text':
        case 'number':
        case 'password':
        case 'email':
            inputEl =
                <input
                    className={styles.textInput}
                    type={type}
                    disabled={disabled}
                    required={required}
                    defaultValue={defaultValue}
                    title={title}
                    minLength={minLength}
                    maxLength={maxLength}
                    min={min}
                    max={max}
                    placeholder={placeholder}
                />
            ;
            break;
        case 'date':
            inputEl =
                <input
                    className={styles.textInput}
                    type={type}
                    disabled={disabled}
                    required={required}
                    defaultValue={defaultValue}
                    title={title}
                    minLength={minLength}
                    maxLength={maxLength}
                    min={min}
                    max={max}
                    placeholder={placeholder}
                />
            ;
            break;
        case 'checkbox':
            inputEl =
                <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    required={required}
                    title={title}
                />
            ;
            break;
    }

    return <div className={styles.container}>
        {label && labelEl}
        {inputEl}
    </div>

}
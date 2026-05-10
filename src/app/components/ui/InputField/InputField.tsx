"use client";

import React, { useEffect, useState } from 'react'
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
    onChange,
    rows,
    maxLines,
    resize = 'vertical',    options,
    labelKey = 'label',
    valueKey = 'value',}: {
    type?: "text" | "email" | "number" | "checkbox" | "password" | "date" | "tel" | "textarea" | "select" | "range",
    required?: boolean,
    checked?: boolean,
    disabled?: boolean,
    title: string,
    defaultValue?: string,
    minLength?: number,
    maxLength?: number,
    min?: number | string,
    max?: number | string,
    placeholder?: string
    label?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
    rows?: number,
    maxLines?: number,
    resize?: 'vertical' | 'none',
    options?: Array<Record<string, any>>,
    labelKey?: string,
    valueKey?: string,
}) {
    const labelEl = type === 'checkbox' ? null : <label htmlFor={title} className={styles.label}>{label}</label>;
    let inputEl;
    // state for controlled number input to enforce min/max during typing
    const [numberValue, setNumberValue] = useState<string | undefined>(defaultValue ?? '');

    useEffect(() => {
        setNumberValue(defaultValue ?? '');
    }, [defaultValue]);

    function clampNumberString(val: string) {
        if (val === '') return '';
        const parsed = Number(val);
        if (!Number.isFinite(parsed)) return '';
        let clamped = parsed;
        if (min !== undefined && min !== null && !Number.isNaN(Number(min))) {
            const minNum = Number(min);
            if (clamped < minNum) clamped = minNum;
        }
        if (max !== undefined && max !== null && !Number.isNaN(Number(max))) {
            const maxNum = Number(max);
            if (clamped > maxNum) clamped = maxNum;
        }
        return String(clamped);
    }

    function handleNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
        const v = event.target.value;
        // allow empty input
        if (v === '') {
            setNumberValue('');
            onChange?.(event as unknown as React.ChangeEvent<HTMLInputElement>);
            return;
        }

        // if not a valid number, ignore (prevents letters/invalid input)
        const parsed = Number(v);
        if (!Number.isFinite(parsed)) return;

        const clampedStr = clampNumberString(v);
        setNumberValue(clampedStr);

        // forward a modified event with clamped value
        const modifiedEvent = {
            ...event,
            target: {
                ...event.target,
                value: clampedStr,
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange?.(modifiedEvent);
    }

    switch (type) {
        case 'text':
        case 'password':
        case 'email':
        case 'tel':
            inputEl =
                <input
                    className={styles.textInput}
                    id={title}
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
                    onChange={onChange}
                />
            ;
            break;
        case 'number':
            inputEl = (
                <input
                    className={styles.textInput}
                    id={title}
                    type="number"
                    disabled={disabled}
                    required={required}
                    value={numberValue}
                    title={title}
                    min={min}
                    max={max}
                    placeholder={placeholder}
                    onChange={handleNumberChange}
                />
            );
            break;
        case 'date':
            inputEl =
                <input
                    className={styles.textInput}
                    id={title}
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
                    onChange={onChange}
                />
            ;
            break;
        case 'textarea':
            {
                const style: React.CSSProperties = {
                    resize: resize === 'vertical' ? 'vertical' : 'none',
                    maxHeight: maxLines ? `${maxLines}em` : undefined,
                    overflow: 'auto',
                };

                inputEl = (
                    <textarea
                        id={title}
                        className={styles.textInput}
                        rows={rows}
                        defaultValue={defaultValue}
                        title={title}
                        minLength={minLength}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        disabled={disabled}
                        required={required}
                        onChange={onChange}
                        style={style}
                    />
                );
            }
            break;
        case 'checkbox':
            inputEl = (
                <label className={styles.toggleLabel}>
                    <input
                        type="checkbox"
                        className={styles.toggleCheckbox}
                        id={title}
                        checked={checked}
                        disabled={disabled}
                        required={required}
                        onChange={onChange as unknown as (e: React.ChangeEvent<HTMLInputElement>) => void}
                        title={title}
                    />
                    {label}
                </label>
            );
            break;
        case 'select':
            inputEl = (
                <select
                    className={styles.textInput}
                    id={title}
                    defaultValue={defaultValue || ''}
                    disabled={disabled}
                    required={required}
                    onChange={onChange}
                    title={title}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options?.map((option) => (
                        <option key={option[valueKey]} value={option[valueKey]}>
                            {option[labelKey]}
                        </option>
                    ))}
                </select>
            );
            break;
        case 'range':
            inputEl = (
                <input
                    className={`${styles.textInput} ${styles.rangeInput}`}
                    id={title}
                    type="range"
                    disabled={disabled}
                    required={required}
                    defaultValue={defaultValue}
                    title={title}
                    min={min}
                    max={max}
                    onChange={onChange}
                />
            );
            break;
    }

    return <div className={styles.container}>
        {label && labelEl}
        {inputEl}
    </div>

}
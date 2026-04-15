"use client";
import { forwardRef } from 'react';
import Link from 'next/link';
import styles from './NavbarLink.module.css';

function NavbarLink({ title, link, isActive }: { title: string, link: string, isActive: boolean }, ref: React.ForwardedRef<HTMLAnchorElement>) {
    const activeLinkClasses = isActive ? styles.activeLink : '';

    return <Link className={`${styles.link} ${activeLinkClasses}`} href={link} ref={ref} data-text={title}>
        <span className={styles.label}>{title}</span>
    </Link>
}

export default forwardRef(NavbarLink);
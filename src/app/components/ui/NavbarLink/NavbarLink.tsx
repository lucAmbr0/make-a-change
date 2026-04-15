"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NavbarLink.module.css';

export default function NavbarLink({ title, link }: { title: string, link: string }) {
    const pathname = usePathname();
    const isActive = link === '/' ? pathname === '/' : pathname.startsWith(link);
    const activeLinkClasses = isActive ? styles.activeLink : '';

    return <Link className={`${styles.link} ${activeLinkClasses}`} href={link}>
        {title}
    </Link>
}
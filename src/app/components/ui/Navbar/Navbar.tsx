"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import NavbarLink from '../NavbarLink/NavbarLink';
import styles from './Navbar.module.css';

export default function Navbar({links}: {links: {title: string, link: string}[]}) {
    const pathname = usePathname();
    const navbarRef = useRef<HTMLElement>(null);
    const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
    const hasPlacedIndicator = useRef(false);
    const [indicator, setIndicator] = useState({ left: 0, top: 0, width: 0, visible: false });
    const [isIndicatorAnimated, setIsIndicatorAnimated] = useState(false);

    const activeIndex = useMemo(() => {
        return links.findIndex(({ link }) => {
            if (link === '/') {
                return pathname === '/';
            }

            return pathname === link || pathname.startsWith(`${link}/`);
        });
    }, [links, pathname]);

    const updateIndicator = useCallback(() => {
        const navbarElement = navbarRef.current;
        const activeElement = activeIndex >= 0 ? linkRefs.current[activeIndex] : null;

        if (!navbarElement || !activeElement) {
            setIndicator((prev) => ({ ...prev, visible: false }));
            return;
        }

        const navbarRect = navbarElement.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        setIndicator({
            left: activeRect.left - navbarRect.left,
            top: activeRect.bottom - navbarRect.top,
            width: activeRect.width,
            visible: true,
        });

        if (!hasPlacedIndicator.current) {
            hasPlacedIndicator.current = true;
            requestAnimationFrame(() => {
                setIsIndicatorAnimated(true);
            });
        }
    }, [activeIndex]);

    useLayoutEffect(() => {
        updateIndicator();

        const handleResize = () => {
            updateIndicator();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [updateIndicator]);

    return <nav className={styles.navbar} ref={navbarRef}>
        {links.map((l, index) => <NavbarLink title={l.title} link={l.link} isActive={activeIndex === index} key={l.title} ref={(element) => {
            linkRefs.current[index] = element;
        }}/>) }
        <span
            aria-hidden="true"
            className={`${styles.activeIndicator} ${isIndicatorAnimated ? styles.activeIndicatorAnimated : ''} ${indicator.visible ? styles.activeIndicatorVisible : ''}`}
            style={{
                width: `${indicator.width}px`,
                transform: `translate(${indicator.left}px, ${indicator.top}px)`,
            }}
        />
    </nav>
}
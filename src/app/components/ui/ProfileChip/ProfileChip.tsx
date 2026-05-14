"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import styles from './ProfileChip.module.css';
import { Icon } from "@iconify/react";
import { useUser } from '@/app/components/logic/UserProvider';
import { apiFetch } from '@/lib/api/client';
import LoginModal from "@/app/components/ui/LoginModal/LoginModal";
import JoinOrganizationModal from "@/app/components/ui/Modal/JoinOrganizationModal/JoinOrganizationModal";

const MOBILE_QUERY = '(max-width: 1024px)';

export default function Profile() {
    const { user, isLoading } = useUser();
    const pathname = usePathname();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isJoinOrgOpen, setIsJoinOrgOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [portalElement, setPortalElement] = useState<Element | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!user) { setUnreadCount(0); return; }
        apiFetch<Array<{ is_read: boolean | number }>>("/api/notification", { method: "GET" })
            .then((data) => setUnreadCount(data.filter((n) => !n.is_read).length))
            .catch(() => {});
    }, [user, pathname]);

    useEffect(() => {
        setPortalElement(document.body);
        const mq = window.matchMedia(MOBILE_QUERY);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (!(isMobile && isMenuOpen)) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMobile, isMenuOpen]);

    useEffect(() => {
        if (!isMenuOpen) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isMenuOpen]);

    const fullName = user ? `${user.first_name} ${user.last_name}` : '';
    const chipText = isLoading ? "..." : user ? fullName : "Accedi";

    function handleClick() {
        if (!user && !isLoading) {
            setIsLoginOpen(true);
            return;
        }
        if (isMobile && user) {
            setIsMenuOpen((value) => !value);
        }
    }

    function handleHoverOpen() {
        if (isMobile) return;
        if (user && !isLoading) {
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
                closeTimerRef.current = null;
            }
            setIsMenuOpen(true);
        }
    }

    function handleHoverClose() {
        if (isMobile) return;
        if (user && !isLoading) {
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
            closeTimerRef.current = setTimeout(() => {
                setIsMenuOpen(false);
                closeTimerRef.current = null;
            }, 120);
        }
    }

    function closeMenu() {
        setIsMenuOpen(false);
    }

    async function handleLogout() {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } finally {
            window.location.reload();
        }
    }

    const menuItems = (
        <>
            <Link href={`/utente/${user?.id}`} className={styles.menuItem} onClick={closeMenu}>
                <Icon icon="material-symbols:person-outline" className={styles.menuIcon} fontSize={"20px"} />
                <span>Profilo</span>
            </Link>
            <Link href={`/utente/notifiche`} className={styles.menuItem} onClick={closeMenu}>
                <Icon icon={unreadCount > 0 ? "material-symbols:notifications-active" : "material-symbols:notifications-outline"} className={styles.menuIcon} fontSize={"20px"} />
                <span>{unreadCount > 0 ? `Notifiche [${unreadCount}]` : "Notifiche"}</span>
            </Link>
            <Link href="/campagne/crea" className={styles.menuItem} onClick={closeMenu}>
                <Icon icon="material-symbols:campaign-outline" className={styles.menuIcon} fontSize={"20px"} />
                <span>Nuova campagna</span>
            </Link>
            <button
                type="button"
                className={styles.menuItem}
                onClick={() => { closeMenu(); setIsJoinOrgOpen(true); }}
            >
                <Icon icon="material-symbols:groups-outline" className={styles.menuIcon} fontSize={"20px"} />
                <span>Entra in un&apos;organizzazione</span>
            </button>
            <button className={styles.menuItem} onClick={handleLogout} type="button">
                <Icon icon="material-symbols:logout" className={styles.menuIcon} fontSize={"20px"} />
                <span>Logout</span>
            </button>
        </>
    );

    const showInlineMenu = Boolean(user) && isMenuOpen && !isMobile;
    const showMobileSheet = Boolean(user) && isMenuOpen && isMobile && portalElement !== null;

    return <>
        <div
            className={styles.profileChipWrapper}
            onMouseEnter={handleHoverOpen}
            onMouseLeave={handleHoverClose}
        >
            <button
                className={`${styles.profileChipContainer} ${user && isMenuOpen && !isMobile ? styles.open : ''}`}
                onClick={handleClick}
                type="button"
                aria-expanded={user ? isMenuOpen : undefined}
                aria-haspopup={user ? "menu" : undefined}
                title={user ? fullName : undefined}
            >
                <Icon icon="material-symbols:account-circle-outline" className={styles.profileIcon} fontSize={"20px"} />
                <p className={styles.chipText}>{chipText}</p>
            </button>
            {showInlineMenu && (
                <div className={styles.profileMenu} role="menu">
                    {menuItems}
                </div>
            )}
        </div>
        {showMobileSheet && portalElement && createPortal(
            <div className={styles.mobileBackdrop} onClick={closeMenu} role="presentation">
                <div
                    className={styles.mobileSheet}
                    onClick={(event) => event.stopPropagation()}
                    role="menu"
                    aria-label="Profile menu"
                >
                    <span className={styles.mobileSheetHandle} aria-hidden="true" />
                    <div className={styles.mobileSheetHeader}>
                        <Icon icon="material-symbols:account-circle-outline" className={styles.mobileSheetAvatar} fontSize={"36px"} />
                        <span className={styles.mobileSheetName}>{fullName}</span>
                        <button
                            type="button"
                            className={styles.mobileSheetClose}
                            onClick={closeMenu}
                            aria-label="Chiudi menu"
                        >
                            <Icon icon="material-symbols:close-rounded" fontSize={"22px"} />
                        </button>
                    </div>
                    <div className={styles.mobileSheetItems}>
                        {menuItems}
                    </div>
                </div>
            </div>,
            portalElement
        )}
        <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        <JoinOrganizationModal open={isJoinOrgOpen} onClose={() => setIsJoinOrgOpen(false)} />
    </>
}

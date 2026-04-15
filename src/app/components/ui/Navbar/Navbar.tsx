import NavbarLink from '../NavbarLink/NavbarLink';
import styles from './Navbar.module.css';

export default function Navbar({links}: {links: {title: string, link: string}[]}) {
    return <nav className={styles.navbar}>
        {links.map(l => <NavbarLink title={l.title} link={l.link} key={l.title}/>)}
    </nav>
}
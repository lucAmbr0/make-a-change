export default function Navbar({links}: {links: string[]}) {
    return <div>
        {links.map(l => <button key={l}>{l}</button>)}
    </div>
}
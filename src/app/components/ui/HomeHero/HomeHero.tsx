import Title from "../Typography/Title/Title"
import styles from "./HomeHero.module.css"
import NumberText from "./NumberText/NumberText"

export default function HomeHero() {
    return <>
        <div className={styles.container}>
            <div>
                <Title text="Crea il cambiamento" alignment="center" />
                <hr className={styles.hr} />
            </div>
            <div className={styles.descContainer}>
                <img src={"/democrazia.jpg"} alt="Urna con voti" className={styles.heroImg} />
                <div className={styles.stepsContainer}>
                    <NumberText number={1} text={"Unisciti a un'organizzazione o crea la tua"} />
                    <NumberText number={2} text={"Pubblica la tua iniziativa con un’organizzazione o da indipendente"} />
                    <NumberText number={3} text={"Diffondi la tua campagna e raccogli sostenitori"} />
                    <NumberText final number={4} text={"Ottieni il cambiamento grazie alla comunità!"} />
                </div>
            </div>

        </div>
    </>
}
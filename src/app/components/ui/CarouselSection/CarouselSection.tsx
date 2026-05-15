import Button from "../Button/Button";
import Carousel from "../Carousel/Carousel";
import Title from "../Typography/Title/Title";
import styles from "./CarouselSection.module.css";

export default function CarouselSection({ title, carouselItems, buttonText, buttonLink, icon }: { title: string, carouselItems: any, buttonText?: string, buttonLink?: string, icon?: string }) {
    return <>
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <Title text={title} alignment="center" />
                {buttonText && buttonLink && <div className={styles.headerButton}><Button text={buttonText} href={buttonLink} icon={icon} iconAlign="right" type="outlined" textSize={20} /></div>}
            </div>
            <Carousel items={carouselItems} />
        </div>
    </>
}
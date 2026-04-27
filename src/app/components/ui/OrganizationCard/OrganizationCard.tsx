import { organizationResponseSchema } from '@/lib/schemas/organization';
import placeholders from '../../logic/placeholders';
import styles from './OrganizationCard.module.css';
import { Icon } from '@iconify/react';

export default function OrganizationCard({ organization: organization }: { organization: organizationResponseSchema }) {
    const imageSrc = organization && organization.cover_path && organization.cover_path.trim() ? organization.cover_path : placeholders.organizationPlaceholderImage;

    return (
        <div className={styles.card}>
            <img src={imageSrc} alt="Immagine dell'organizzazione" className={styles.organizationImage} />
            <h2 className={styles.organizationName}>{organization.name}</h2>
            <p className={styles.organizationCategory}>{organization.category || "Altre categorie"}</p>
            <div className={styles.statsContainer}>
                <Icon icon={'material-symbols:diversity-3'} width="18" height="18" />
                <p>{10} membri</p>
                <Icon icon={'material-symbols:docs'} width="18" height="18" />
                <p>{20} campagne</p>
            </div>
        </div>
    );
}
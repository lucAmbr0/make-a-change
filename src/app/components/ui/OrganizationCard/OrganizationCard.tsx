import { organizationResponseSchema } from '@/lib/schemas/organization';
import styles from './OrganizationCard.module.css';
import { Icon } from '@iconify/react';
import { resolveCoverSrc } from '../../logic/coverImage';

export default function OrganizationCard({ organization: organization }: { organization: organizationResponseSchema }) {
    const imageSrc = resolveCoverSrc(organization?.cover_path);

    return (
        <div className={styles.card}>
            <img src={imageSrc} alt="Immagine dell'organizzazione" className={styles.organizationImage} />
            <h2 className={styles.organizationName}>{organization.name}</h2>
            <p className={styles.organizationCategory}>{organization.category || "Altre categorie"}</p>
            <div className={styles.statsContainer}>
                <Icon icon={'material-symbols:diversity-3'} width="18" height="18" />
                <p>{organization.members_count ?? 0} membri</p>
                <Icon icon={'material-symbols:docs-outline'} width="18" height="18" />
                <p>{organization.campaigns_count ?? 0} campagne</p>
            </div>
        </div>
    );
}
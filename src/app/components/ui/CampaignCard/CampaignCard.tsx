import { campaignResponseSchema } from '@/lib/schemas/campaigns';
import placeholders from '../../logic/placeholders';
import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './CampaignCard.module.css';
import Link from 'next/link';

interface CampaignCardProps {
    campaign: campaignResponseSchema;
    href?: string;
}

export default function CampaignCard({ campaign, href }: CampaignCardProps) {
    const imageSrc = campaign && campaign.cover_path && campaign.cover_path.trim() ? campaign.cover_path : placeholders.campaignPlaceholderImage;

    const cardContent = (
        <>
            <img src={imageSrc} alt="Immagine della campagna" className={styles.campaignImage} />
            <h2 className={styles.campaignName}>{campaign.title}</h2>
            <p className={styles.organizationName}>{campaign.organization_name || 'Indipendente'}</p>
            <p className={styles.campaignDescription}>{campaign.description}</p>
            <div className={styles.progressContainer}>
                <ProgressBar unit='sostenitori' showLabel={true} total={campaign.signature_goal || campaign.signatures} current={campaign.signatures || 0} />
            </div>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={styles.card}>
                {cardContent}
            </Link>
        );
    }

    return (
        <div className={styles.card}>
            {cardContent}
        </div>
    );
}
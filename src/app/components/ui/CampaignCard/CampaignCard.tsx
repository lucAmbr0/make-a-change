import { campaignResponseSchema } from '@/lib/schemas/campaigns';
import placeholders from '../../logic/placeholders';
import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './CampaignCard.module.css';

export default function CampaignCard({ campaign }: { campaign: campaignResponseSchema }) {
    const imageSrc = campaign && campaign.cover_path && campaign.cover_path.trim() ? campaign.cover_path : placeholders.campaignPlaceholderImage;

    return (
        <div className={styles.card}>
            <img src={imageSrc} alt="Immagine della campagna" className={styles.campaignImage} />
            <h2 className={styles.campaignName}>{campaign.title}</h2>
            <p className={styles.organizationName}>{campaign.organization_name || 'Indipendente'}</p>
            <p className={styles.campaignDescription}>{campaign.description}</p>
            <div className={styles.progressContainer}>
                <ProgressBar unit='sostenitori' showLabel={true} total={campaign.signature_goal || campaign.signatures} current={campaign.signatures || 0} />
            </div>
        </div>
    );
}
import styles from "./Paragraph.module.css";

type ParagraphAlignment = 'left' | 'center' | 'right' | 'justify';
type ParagraphColor = 'accent-950' | 'accent-900' | 'bw-950' | 'bw-900';

export default function Paragraph({ text, alignment = 'justify', color = 'accent-950' }: { text: string, alignment?: ParagraphAlignment, color?: ParagraphColor }) {
	const alignmentClass = {
		left: styles.left,
		center: styles.center,
		right: styles.right,
		justify: styles.justify,
	}[alignment];

	const colorClass = {
		'accent-950': styles.accent950,
		'accent-900': styles.accent900,
		'bw-950': styles.bw950,
		'bw-900': styles.bw900,
	}[color];

	return <p className={`${styles.paragraph} ${alignmentClass} ${colorClass}`}>{text}</p>

}
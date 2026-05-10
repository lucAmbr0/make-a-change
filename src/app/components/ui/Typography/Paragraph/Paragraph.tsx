import styles from "./Paragraph.module.css";
import type React from "react";

type ParagraphAlignment = 'left' | 'center' | 'right' | 'justify';
type ParagraphColor = 'accent-950' | 'accent-900' | 'bw-950' | 'bw-900';

export default function Paragraph({
	text,
	alignment = 'justify',
	color = 'accent-950',
	fontSize,
	margin,
	marginTop,
	marginRight,
	marginBottom,
	marginLeft,
}: {
	text?: string | null,
	alignment?: ParagraphAlignment,
	color?: ParagraphColor,
	fontSize?: React.CSSProperties['fontSize'],
	margin?: React.CSSProperties['margin'],
	marginTop?: React.CSSProperties['marginTop'],
	marginRight?: React.CSSProperties['marginRight'],
	marginBottom?: React.CSSProperties['marginBottom'],
	marginLeft?: React.CSSProperties['marginLeft'],
}) {
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

	const style: React.CSSProperties = {
		fontSize,
		margin,
		marginTop,
		marginRight,
		marginBottom,
		marginLeft,
	};

	return <p className={`${styles.paragraph} ${alignmentClass} ${colorClass}`} style={style}>{text}</p>

}
"use client";

import { Icon } from "@iconify/react";
import { Children, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Carousel.module.css";

const CARD_GAP = 20;

type CarouselProps = {
	items?: ReactNode[];
	children?: ReactNode;
	direction?: "horizontal" | "vertical";
	rows?: number;
	className?: string;
};

function useNodeList(items?: ReactNode[], children?: ReactNode) {
	return useMemo(() => {
		if (items && items.length > 0) {
			return items;
		}
		return Children.toArray(children);
	}, [items, children]);
}

export default function Carousel({
	items,
	children,
	direction = "horizontal",
	rows = 1,
	className,
}: CarouselProps) {
	const nodes = useNodeList(items, children);

	if (direction === "vertical") {
		return <VerticalCarousel nodes={nodes} rows={rows} className={className} />;
	}

	return <HorizontalCarousel nodes={nodes} className={className} />;
}

function HorizontalCarousel({ nodes, className }: { nodes: ReactNode[]; className?: string }) {
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const firstItemRef = useRef<HTMLDivElement | null>(null);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);
	const [peekSize, setPeekSize] = useState(80);
	const [stepSize, setStepSize] = useState(300);

	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) {
			return;
		}

		const updateMetrics = () => {
			const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
			const left = viewport.scrollLeft;
			setCanScrollPrev(left > 2);
			setCanScrollNext(left < maxScroll - 2);

			const firstItemWidth = firstItemRef.current?.offsetWidth || 0;
			if (firstItemWidth > 0) {
				setPeekSize(Math.round(firstItemWidth / 2));
				setStepSize(firstItemWidth + CARD_GAP);
			}
		};

		updateMetrics();

		const resizeObserver = new ResizeObserver(updateMetrics);
		resizeObserver.observe(viewport);
		if (firstItemRef.current) {
			resizeObserver.observe(firstItemRef.current);
		}

		viewport.addEventListener("scroll", updateMetrics, { passive: true });

		return () => {
			viewport.removeEventListener("scroll", updateMetrics);
			resizeObserver.disconnect();
		};
	}, [nodes.length]);

	const scrollByStep = (directionFactor: 1 | -1) => {
		const viewport = viewportRef.current;
		if (!viewport) {
			return;
		}

		viewport.scrollBy({
			left: directionFactor * stepSize,
			behavior: "smooth",
		});
	};

	return (
		<section className={`${styles.carousel} ${styles.horizontal} ${className || ""}`.trim()}>
			{canScrollPrev && (
				<button
					type="button"
					className={`${styles.arrowButton} ${styles.leftArrow}`}
					onClick={() => scrollByStep(-1)}
					aria-label="Scorri indietro"
				>
					<Icon icon="material-symbols:arrow-forward-ios-rounded" rotate={90} width="18" height="18" />
				</button>
			)}

			<div className={styles.horizontalViewport} ref={viewportRef} style={{ paddingRight: `${peekSize}px` }}>
				<div className={styles.horizontalTrack}>
					{nodes.map((node, index) => (
						<div
							key={`carousel-item-${index}`}
							ref={index === 0 ? firstItemRef : undefined}
							className={styles.itemWrapper}
						>
							{node}
						</div>
					))}
				</div>
			</div>

			{canScrollNext && (
				<button
					type="button"
					className={`${styles.arrowButton} ${styles.rightArrow}`}
					onClick={() => scrollByStep(1)}
					aria-label="Scorri avanti"
				>
					<Icon icon="material-symbols:arrow-forward-ios-rounded" width="18" height="18" />
				</button>
			)}

			{canScrollPrev && <div className={`${styles.edgeFade} ${styles.edgeFadeLeft}`} aria-hidden="true" />}
			{canScrollNext && <div className={`${styles.edgeFade} ${styles.edgeFadeRight}`} aria-hidden="true" />}
		</section>
	);
}

function VerticalCarousel({
	nodes,
	rows,
	className,
}: {
	nodes: ReactNode[];
	rows: number;
	className?: string;
}) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const firstItemRef = useRef<HTMLDivElement | null>(null);
	const [visibleRows, setVisibleRows] = useState(Math.max(1, rows));
	const [itemsPerRow, setItemsPerRow] = useState(1);

	useEffect(() => {
		setVisibleRows(Math.max(1, rows));
	}, [rows]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const updateLayout = () => {
			const containerWidth = container.clientWidth;
			const itemWidth = firstItemRef.current?.offsetWidth || 0;

			if (containerWidth <= 0 || itemWidth <= 0) {
				setItemsPerRow(1);
				return;
			}

			const perRow = Math.max(1, Math.floor((containerWidth + CARD_GAP) / (itemWidth + CARD_GAP)));
			setItemsPerRow(perRow);
		};

		updateLayout();

		const resizeObserver = new ResizeObserver(updateLayout);
		resizeObserver.observe(container);
		if (firstItemRef.current) {
			resizeObserver.observe(firstItemRef.current);
		}

		return () => resizeObserver.disconnect();
	}, [nodes.length]);

	const normalizedRows = Math.max(1, rows);
	const visibleItemsCount = visibleRows * itemsPerRow;
	const hasMore = visibleItemsCount < nodes.length;
	const visibleNodes = nodes.slice(0, visibleItemsCount);

	return (
		<section className={`${styles.carousel} ${styles.vertical} ${className || ""}`.trim()}>
			<div className={styles.verticalGrid} ref={containerRef}>
				{visibleNodes.map((node, index) => (
					<div
						key={`carousel-item-${index}`}
						ref={index === 0 ? firstItemRef : undefined}
						className={styles.itemWrapper}
					>
						{node}
					</div>
				))}
			</div>

			{hasMore && (
				<div className={styles.showMoreArea}>
					<div className={styles.bottomFade} aria-hidden="true" />
					<button
						type="button"
						className={styles.showMoreButton}
						onClick={() => setVisibleRows((currentRows) => currentRows + normalizedRows)}
					>
						<Icon icon="material-symbols:keyboard-arrow-down-rounded" width="20" height="20" />
						<span>Show more</span>
					</button>
				</div>
			)}
		</section>
	);
}
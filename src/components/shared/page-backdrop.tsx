export default function PageBackdrop() {
	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
			<div className="absolute inset-x-0 top-0 mx-auto h-120 max-w-5xl rounded-b-[4rem] bg-linear-to-b from-secondary/60 via-secondary/20 to-transparent" />
			<div className="absolute top-24 left-1/2 h-72 w-2xl -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
		</div>
	);
}

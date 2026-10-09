"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import {
	CalendarBlank,
	CaretDown,
	CaretLeft,
	CaretRight,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { cn } from "cn";
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function parseISODate(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return null;
	const date = new Date(
		Number(match[1]),
		Number(match[2]) - 1,
		Number(match[3]),
	);
	return Number.isNaN(date.getTime()) ? null : date;
}

function toISODate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatLong(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function formatShort(date: Date): string {
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function Calendar({
	selected,
	min,
	max,
	view,
	onViewChange,
	onSelect,
}: {
	selected: Date | null;
	min?: Date;
	max?: Date;
	view: { year: number; month: number };
	onViewChange: (view: { year: number; month: number }) => void;
	onSelect: (date: Date) => void;
}) {
	const cells = useMemo(() => {
		const first = new Date(view.year, view.month, 1);
		const start = new Date(first);
		start.setDate(1 - first.getDay());
		return Array.from({ length: 42 }, (_, i) => {
			const date = new Date(start);
			date.setDate(start.getDate() + i);
			return date;
		});
	}, [view]);

	const minDay = min ? startOfDay(min).getTime() : null;
	const maxDay = max ? startOfDay(max).getTime() : null;
	const selectedDay = selected ? startOfDay(selected).getTime() : null;
	const todayDay = startOfDay(new Date()).getTime();
	const yearOptions = useMemo(() => {
		const base = new Date().getFullYear();
		return Array.from({ length: 7 }, (_, i) => base + i);
	}, []);

	function shiftMonth(delta: number) {
		const date = new Date(view.year, view.month + delta, 1);
		onViewChange({ year: date.getFullYear(), month: date.getMonth() });
	}

	return (
		<div className="w-72 p-3">
			{/* header */}
			<div className="flex items-center gap-1">
				<button
					type="button"
					aria-label="Previous month"
					onClick={() => shiftMonth(-1)}
					className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
				>
					<CaretLeft className="size-4" />
				</button>
				<div className="flex min-w-0 flex-1 items-center gap-1.5">
					<label className="relative min-w-0 flex-[1.4]">
						<span className="sr-only">Month</span>
						<select
							value={view.month}
							onChange={(e) =>
								onViewChange({ year: view.year, month: Number(e.target.value) })
							}
							className="w-full cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-1.5 pr-6 pl-2 text-sm font-semibold transition-colors outline-none hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/60"
						>
							{MONTHS.map((label, i) => (
								<option key={label} value={i}>
									{label}
								</option>
							))}
						</select>
						<CaretDown className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
					</label>
					<label className="relative w-[4.7rem] shrink-0">
						<span className="sr-only">Year</span>
						<select
							value={view.year}
							onChange={(e) =>
								onViewChange({
									year: Number(e.target.value),
									month: view.month,
								})
							}
							className="w-full cursor-pointer appearance-none rounded-lg border border-transparent bg-transparent py-1.5 pr-6 pl-2 text-sm font-semibold tabular-nums transition-colors outline-none hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/60"
						>
							{yearOptions.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
						<CaretDown className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
					</label>
				</div>
				<button
					type="button"
					aria-label="Next month"
					onClick={() => shiftMonth(1)}
					className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
				>
					<CaretRight className="size-4" />
				</button>
			</div>

			{/* weekdays */}
			<div className="mt-2 grid grid-cols-7" aria-hidden>
				{WEEKDAYS.map((day) => (
					<span
						key={day}
						className="grid h-8 place-items-center text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase"
					>
						{day}
					</span>
				))}
			</div>

			{/* days */}
			<div className="grid grid-cols-7 gap-0.5">
				{cells.map((date) => {
					const day = startOfDay(date).getTime();
					const outside = date.getMonth() !== view.month;
					const disabled =
						(minDay !== null && day < minDay) ||
						(maxDay !== null && day > maxDay);
					const isSelected = selectedDay === day;
					const isToday = todayDay === day;
					return (
						<button
							key={day}
							type="button"
							aria-label={formatLong(date)}
							aria-pressed={isSelected ? true : undefined}
							aria-current={isToday ? "date" : undefined}
							disabled={disabled}
							onClick={() => onSelect(startOfDay(date))}
							className={cn(
								"grid h-9 place-items-center rounded-lg text-sm tabular-nums transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
								isSelected
									? "bg-primary font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
									: "hover:bg-muted",
								!isSelected &&
									isToday &&
									"font-bold text-primary ring-1 ring-primary/50 ring-inset",
								outside && !isSelected && "text-muted-foreground/40",
								disabled &&
									"cursor-not-allowed opacity-35 hover:bg-transparent",
							)}
						>
							{date.getDate()}
						</button>
					);
				})}
			</div>

			{/* footer */}
			<div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
				<span className="text-xs text-muted-foreground">
					{minDay !== null ? "No past dates" : "Pick a deadline"}
				</span>
				<button
					type="button"
					onClick={() => {
						const today = startOfDay(new Date());
						onViewChange({
							year: today.getFullYear(),
							month: today.getMonth(),
						});
						if (minDay === null || today.getTime() >= minDay) {
							onSelect(today);
						}
					}}
					className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
				>
					Today
				</button>
			</div>
		</div>
	);
}

export function DatePicker({
	id,
	value,
	onChange,
	min,
	max,
	placeholder = "Pick a date",
	invalid,
	className,
}: {
	id?: string;
	value: string;
	onChange: (isoDate: string) => void;
	min?: string;
	max?: string;
	placeholder?: string;
	invalid?: boolean;
	className?: string;
}) {
	const [open, setOpen] = useState(false);
	const selected = parseISODate(value);
	const minDate = min ? (parseISODate(min) ?? undefined) : undefined;
	const maxDate = max
		? (parseISODate(max) ?? undefined)
		: (() => {
				const d = new Date();
				return new Date(d.getFullYear() + 5, d.getMonth(), d.getDate());
			})();

	const [view, setView] = useState(() => {
		const base = selected ?? new Date();
		return { year: base.getFullYear(), month: base.getMonth() };
	});

	return (
		<PopoverPrimitive.Root
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (next) {
					const base = parseISODate(value) ?? new Date();
					setView({ year: base.getFullYear(), month: base.getMonth() });
				}
			}}
		>
			<PopoverPrimitive.Trigger
				id={id}
				aria-invalid={invalid}
				className={cn(
					"flex h-10 w-full items-center gap-2.5 rounded-xl border border-input bg-transparent px-3 text-sm shadow-xs transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/80",
					selected ? "text-foreground" : "text-muted-foreground/70",
					invalid && "border-destructive/60",
					className,
				)}
			>
				<CalendarBlank className="size-4 shrink-0 text-primary" />
				<span className="min-w-0 flex-1 truncate text-left tabular-nums">
					{selected ? formatShort(selected) : placeholder}
				</span>
				<CaretDown
					className={cn(
						"size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
						open && "rotate-180",
					)}
				/>
			</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Positioner
					align="start"
					side="bottom"
					sideOffset={6}
					className="z-50"
				>
					<PopoverPrimitive.Popup className="overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg transition-all duration-150 ease-snappy data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
						<Calendar
							selected={selected}
							min={minDate}
							max={maxDate}
							view={view}
							onViewChange={setView}
							onSelect={(date) => {
								onChange(toISODate(date));
								setOpen(false);
							}}
						/>
					</PopoverPrimitive.Popup>
				</PopoverPrimitive.Positioner>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
}

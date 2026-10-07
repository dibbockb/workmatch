"use client";

import { UsersThree } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import {
	JobCard,
	JobListSkeleton,
	JobsEmpty,
	JobsError,
	JobsPagination,
	JobsSearch,
} from "@/features/jobs/job-list";
import { useJobs } from "@/features/jobs/queries";

export default function FindWorkPage() {
	const router = useRouter();
	const params = useSearchParams();
	const search = params.get("search") ?? "";
	const page = Math.max(1, Number(params.get("page") ?? 1) || 1);

	// Local mirror of the URL search param so the field stays in sync even
	// when the URL changes from outside (back/forward navigation).
	const [query, setQuery] = useState(search);
	useEffect(() => setQuery(search), [search]);

	const { data, isLoading, isError, isFetching, refetch } = useJobs({
		search,
		page,
	});
	const jobs = data?.data.jobs ?? [];
	const pagination = data?.data.pagination;

	function setParam(key: string, value: string) {
		const next = new URLSearchParams(params);
		value ? next.set(key, value) : next.delete(key);
		if (key !== "page") next.delete("page");
		router.push(`?${next.toString()}`);
	}

	function onSearch(value: string) {
		setQuery(value);
		setParam("search", value);
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<PageHeader
				title="Find work"
				description="Browse what clients are hiring for right now and send proposals to the jobs that fit you."
				actions={
					<HeaderStat
						value={pagination?.total ?? jobs.length}
						label="jobs listed"
						loading={isLoading}
					/>
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<JobsSearch
					value={query}
					onChange={onSearch}
					label="Search jobs by title"
				/>
				{isFetching && !isLoading && (
					<span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
						<span
							aria-hidden
							className="size-1.5 animate-pulse rounded-full bg-primary"
						/>
						Updating results…
					</span>
				)}
			</div>

			{isError && <JobsError onRetry={() => refetch()} />}

			{isLoading ? (
				<JobListSkeleton />
			) : jobs.length === 0 ? (
				search ? (
					<JobsEmpty
						title="No jobs match your search"
						description={`Nothing found for “${search}”. Try another keyword, or clear the search to see everything.`}
						action={
							<Button variant="outline" size="sm" onClick={() => onSearch("")}>
								Clear search
							</Button>
						}
					/>
				) : (
					<JobsEmpty
						title="No jobs posted yet"
						description="New gigs show up here the moment clients post them. Check back soon."
					/>
				)
			) : (
				<ul className="grid gap-3">
					{jobs.map((job, index) => (
						<JobCard
							key={job.id}
							job={job}
							index={index}
							meta={
								job.client?.name ? (
									<span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
										<UsersThree className="size-4 shrink-0" />
										<span className="truncate">{job.client.name}</span>
									</span>
								) : undefined
							}
						/>
					))}
				</ul>
			)}

			{pagination && (
				<JobsPagination
					page={page}
					totalPages={pagination.totalPages}
					total={pagination.total}
					limit={pagination.limit}
					disabled={isFetching}
					onChange={(next) => setParam("page", String(next))}
				/>
			)}
		</div>
	);
}

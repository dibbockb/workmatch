"use client";

import { FileText, Plus } from "@phosphor-icons/react";
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
import { NewJobButton } from "@/features/jobs/job-form";
import { useMyJobs } from "@/features/jobs/queries";

export const NEW_JOB_HREF = "/dashboard/client/jobs/new";

export default function MyJobsPage() {
	const router = useRouter();
	const params = useSearchParams();
	const search = params.get("search") ?? "";
	const page = Math.max(1, Number(params.get("page") ?? 1) || 1);

	// Local mirror of the URL search param so the field stays in sync even
	// when the URL changes from outside (back/forward navigation).
	const [query, setQuery] = useState(search);
	useEffect(() => setQuery(search), [search]);

	const { data, isLoading, isError, isFetching, refetch } = useMyJobs({ page });
	const jobs = data?.data.jobs ?? [];
	const pagination = data?.data.pagination;

	// `my-posted` is paged server-side, so narrow the loaded page locally.
	const needle = query.trim().toLowerCase();
	const visibleJobs = needle
		? jobs.filter((job) => job.title.toLowerCase().includes(needle))
		: jobs;

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

	function goToNewJob() {
		router.push(NEW_JOB_HREF);
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<PageHeader
				title="My jobs"
				description="Everything you have posted, in one place — keep an eye on each job from open to completed."
				actions={
					<>
						<HeaderStat
							value={pagination?.total ?? jobs.length}
							label="jobs posted"
							loading={isLoading}
						/>
						<NewJobButton onClick={goToNewJob} />
					</>
				}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<JobsSearch
					value={query}
					onChange={onSearch}
					label="Search your jobs by title"
				/>
				<div className="flex items-center justify-between gap-3 sm:justify-end">
					{isFetching && !isLoading && (
						<span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
							<span
								aria-hidden
								className="size-1.5 animate-pulse rounded-full bg-primary"
							/>
							Updating results…
						</span>
					)}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={goToNewJob}
						className="sm:hidden"
					>
						<Plus className="size-3.5" data-icon="inline-start" />
						New job
					</Button>
				</div>
			</div>

			{isError && <JobsError onRetry={() => refetch()} />}

			{isLoading ? (
				<JobListSkeleton />
			) : visibleJobs.length === 0 ? (
				needle ? (
					<JobsEmpty
						title="No jobs match your search"
						description={`Nothing on this page matches “${query.trim()}”. Try another keyword, or clear the search to see everything.`}
						action={
							<Button variant="outline" size="sm" onClick={() => onSearch("")}>
								Clear search
							</Button>
						}
					/>
				) : (
					<JobsEmpty
						title="You have not posted any jobs yet"
						description="Jobs you post show up here so you can track proposals, contracts and progress in one place."
						action={
							<Button size="sm" onClick={goToNewJob}>
								<Plus className="size-3.5" data-icon="inline-start" />
								Post your first job
							</Button>
						}
					/>
				)
			) : (
				<ul className="grid gap-3">
					{visibleJobs.map((job, index) => (
						<JobCard
							key={job.id}
							job={job}
							index={index}
							href={`/dashboard/client/jobs/${job.id}`}
							meta={
								typeof job.proposalCount === "number" ? (
									<span className="inline-flex items-center gap-1.5 text-muted-foreground">
										<FileText className="size-4 shrink-0" />
										<span className="font-medium text-foreground">
											{job.proposalCount}
										</span>
										{job.proposalCount === 1 ? "proposal" : "proposals"}
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
					unit="jobs"
					disabled={isFetching}
					onChange={(next) => setParam("page", String(next))}
				/>
			)}
		</div>
	);
}

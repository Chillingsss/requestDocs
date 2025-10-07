import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../components/ui/select";
import { Plus, Edit, Trash2, Users, Search } from "lucide-react";

export default function SectionsTab({
	sections,
	gradeLevels,
	loading,
	onAdd,
	onEdit,
	onDelete,
}) {
	const [selectedGradeLevel, setSelectedGradeLevel] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");

	const filteredSections = useMemo(() => {
		return sections.filter((section) => {
			const matchesGradeLevel =
				selectedGradeLevel === "all" ||
				Number(section.gradeLevelId) === Number(selectedGradeLevel);
			const matchesSearch = section.name
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			return matchesGradeLevel && matchesSearch;
		});
	}, [sections, selectedGradeLevel, searchTerm]);
	if (loading) {
		return (
			<div className="py-8 text-center text-slate-600 dark:text-slate-400">
				Loading...
			</div>
		);
	}

	if (!Array.isArray(sections)) {
		return (
			<Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
					<Users className="mx-auto mb-4 w-12 h-12 text-slate-300 dark:text-slate-600" />
					<p>Sections data is invalid</p>
				</CardContent>
			</Card>
		);
	}

	if (sections.length === 0) {
		return (
			<Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
					<Users className="mx-auto mb-4 w-12 h-12 text-slate-300 dark:text-slate-600" />
					<p>No sections found</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
				<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
					Sections
				</h3>
				<Button
					onClick={() => onAdd("section")}
					className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
				>
					<Plus className="w-4 h-4" />
					Add Section
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
						<Input
							placeholder="Search sections..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
						/>
					</div>
				</div>
				<div className="sm:w-64">
					<Select
						value={selectedGradeLevel}
						onValueChange={setSelectedGradeLevel}
					>
						<SelectTrigger className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
							<SelectValue placeholder="Filter by grade level" />
						</SelectTrigger>
						<SelectContent className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
							<SelectItem
								value="all"
								className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600"
							>
								All Grade Levels
							</SelectItem>
							{gradeLevels.map((gradeLevel) => (
								<SelectItem
									key={gradeLevel.id}
									value={gradeLevel.id}
									className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600"
								>
									{gradeLevel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Results count */}
			<div className="text-sm text-slate-600 dark:text-slate-400">
				Showing {filteredSections.length} of {sections.length} sections
			</div>

			{/* Sections Grid */}
			{filteredSections.length === 0 ? (
				<Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
					<CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
						<Users className="mx-auto mb-4 w-12 h-12 text-slate-300 dark:text-slate-600" />
						<p>No sections match your filters</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredSections.map((section) => (
						<Card
							key={section.id}
							className="bg-white transition-shadow hover:shadow-md dark:bg-slate-800 border-slate-200 dark:border-slate-700"
						>
							<CardContent className="p-4">
								<div className="flex justify-between items-start mb-3">
									<Users className="w-8 h-8 text-purple-500 dark:text-purple-400" />
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(section, "section")}
											className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => onDelete(section.id, "section")}
											className="text-red-600 border-red-300 dark:border-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
								<h4 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
									{section.name}
								</h4>
								<p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
									Grade Level: {section.gradeLevelName}
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-500">
									Created: {new Date(section.createdAt).toLocaleDateString()}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

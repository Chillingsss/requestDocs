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
		return <div className="text-center py-8">Loading...</div>;
	}

	if (sections.length === 0) {
		return (
			<Card>
				<CardContent className="p-8 text-center text-slate-500">
					<Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
					<p>No sections found</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h3 className="text-lg font-semibold">Sections</h3>
				<Button
					onClick={() => onAdd("section")}
					className="flex gap-2 items-center"
				>
					<Plus className="w-4 h-4" />
					Add Section
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
						<Input
							placeholder="Search sections..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>
				<div className="sm:w-64">
					<Select
						value={selectedGradeLevel}
						onValueChange={setSelectedGradeLevel}
					>
						<SelectTrigger>
							<SelectValue placeholder="Filter by grade level" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Grade Levels</SelectItem>
							{gradeLevels.map((gradeLevel) => (
								<SelectItem key={gradeLevel.id} value={gradeLevel.id}>
									{gradeLevel.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Results count */}
			<div className="text-sm text-slate-600">
				Showing {filteredSections.length} of {sections.length} sections
			</div>

			{/* Sections Grid */}
			{filteredSections.length === 0 ? (
				<Card>
					<CardContent className="p-8 text-center text-slate-500">
						<Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
						<p>No sections match your filters</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredSections.map((section) => (
						<Card
							key={section.id}
							className="hover:shadow-md transition-shadow"
						>
							<CardContent className="p-4">
								<div className="flex justify-between items-start mb-3">
									<Users className="w-8 h-8 text-purple-500" />
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(section, "section")}
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => onDelete(section.id, "section")}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
								<h4 className="font-semibold mb-1">{section.name}</h4>
								<p className="text-sm text-slate-600 mb-2">
									Grade Level: {section.gradeLevelName}
								</p>
								<p className="text-sm text-slate-500">
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

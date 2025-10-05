import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Edit, Trash2, Users } from "lucide-react";

export default function SectionsTab({
	sections,
	loading,
	onAdd,
	onEdit,
	onDelete,
}) {
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
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Sections</h3>
				<Button
					onClick={() => onAdd("section")}
					className="flex gap-2 items-center"
				>
					<Plus className="w-4 h-4" />
					Add Section
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{sections.map((section) => (
					<Card key={section.id} className="hover:shadow-md transition-shadow">
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
		</div>
	);
}

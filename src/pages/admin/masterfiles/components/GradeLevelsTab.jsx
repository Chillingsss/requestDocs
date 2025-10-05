import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Edit, Trash2, GraduationCap } from "lucide-react";

export default function GradeLevelsTab({
	gradeLevels,
	loading,
	onAdd,
	onEdit,
	onDelete,
}) {
	if (loading) {
		return <div className="text-center py-8">Loading...</div>;
	}

	if (gradeLevels.length === 0) {
		return (
			<Card>
				<CardContent className="p-8 text-center text-slate-500">
					<GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
					<p>No grade levels found</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Grade Levels</h3>
				<Button
					onClick={() => onAdd("gradeLevel")}
					className="flex gap-2 items-center"
				>
					<Plus className="w-4 h-4" />
					Add Grade Level
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{gradeLevels.map((gradeLevel) => (
					<Card key={gradeLevel.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-4">
							<div className="flex justify-between items-start mb-3">
								<GraduationCap className="w-8 h-8 text-green-500" />
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(gradeLevel, "gradeLevel")}
									>
										<Edit className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onDelete(gradeLevel.id, "gradeLevel")}
										className="text-red-600 hover:text-red-700"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
							<h4 className="font-semibold mb-2">{gradeLevel.name}</h4>
							<p className="text-sm text-slate-600">
								Created: {new Date(gradeLevel.createdAt).toLocaleDateString()}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

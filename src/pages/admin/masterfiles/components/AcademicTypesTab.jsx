import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Edit, Trash2, BookOpen, Loader2 } from "lucide-react";

export default function AcademicTypesTab({
	academicTypes = [],
	loading,
	onAdd,
	onEdit,
	onDelete,
}) {
	if (loading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="w-8 h-8 animate-spin text-slate-400" />
			</div>
		);
	}

	if (academicTypes.length === 0) {
		return (
			<Card>
				<CardContent className="p-8 text-center text-slate-500">
					<BookOpen className="mx-auto mb-4 w-12 h-12 text-slate-300" />
					<p>No academic types found</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-semibold">Academic Types</h3>
					<Button
						onClick={() => onAdd("academicType")}
						className="flex gap-2 items-center"
					>
						<Plus className="w-4 h-4" />
						Add Academic Type
					</Button>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{academicTypes.map((academicType) => (
						<Card
							key={academicType.id}
							className="transition-shadow hover:shadow-md"
						>
							<CardContent className="p-4">
								<div className="flex justify-between items-start mb-3">
									<BookOpen className="w-8 h-8 text-blue-500" />
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(academicType, "academicType")}
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => onDelete(academicType.id, "academicType")}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
								<h4 className="mb-1 font-semibold">{academicType.name}</h4>
								<p className="mb-2 text-sm text-slate-600">
									{academicType.description || "-"}
								</p>
								<p className="text-xs text-slate-500">
									Created:{" "}
									{academicType.createdAt
										? new Date(academicType.createdAt).toLocaleDateString()
										: "-"}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</>
	);
}

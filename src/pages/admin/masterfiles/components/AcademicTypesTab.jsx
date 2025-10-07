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
			<div className="py-8 text-center text-slate-600 dark:text-slate-400">
				Loading...
			</div>
		);
	}

	if (!Array.isArray(academicTypes)) {
		return (
			<Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
					<BookOpen className="mx-auto mb-4 w-12 h-12 text-slate-300 dark:text-slate-600" />
					<p>Academic types data is invalid</p>
				</CardContent>
			</Card>
		);
	}

	if (academicTypes.length === 0) {
		return (
			<Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
					<BookOpen className="mx-auto mb-4 w-12 h-12 text-slate-300 dark:text-slate-600" />
					<p>No academic types found</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
						Academic Types
					</h3>
					<Button
						onClick={() => onAdd("academicType")}
						className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
					>
						<Plus className="w-4 h-4" />
						Add Academic Type
					</Button>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{academicTypes.map((academicType) => (
						<Card
							key={academicType.id}
							className="bg-white transition-shadow hover:shadow-md dark:bg-slate-800 border-slate-200 dark:border-slate-700"
						>
							<CardContent className="p-4">
								<div className="flex justify-between items-start mb-3">
									<BookOpen className="w-8 h-8 text-blue-500 dark:text-blue-400" />
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(academicType, "academicType")}
											className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => onDelete(academicType.id, "academicType")}
											className="text-red-600 border-red-300 dark:border-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
								<h4 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
									{academicType.name}
								</h4>
								<p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
									{academicType.description || "-"}
								</p>
								<p className="text-xs text-slate-500 dark:text-slate-500">
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

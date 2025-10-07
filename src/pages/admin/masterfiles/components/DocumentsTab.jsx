import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Edit, Trash2, FileText } from "lucide-react";

export default function DocumentsTab({
	documents,
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

	if (!Array.isArray(documents)) {
		return (
			<Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
					<FileText className="mx-auto mb-4 w-12 h-12 text-slate-300 dark:text-slate-600" />
					<p>Documents data is invalid</p>
				</CardContent>
			</Card>
		);
	}

	if (documents.length === 0) {
		return (
			<Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<CardContent className="p-8 text-center text-slate-500 dark:text-slate-400">
					<FileText className="mx-auto mb-4 w-12 h-12 text-slate-300 dark:text-slate-600" />
					<p>No documents found</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
					Documents
				</h3>
				<Button
					onClick={() => onAdd("document")}
					className="flex gap-2 items-center text-white bg-blue-600 hover:bg-blue-700"
				>
					<Plus className="w-4 h-4" />
					Add Document
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{documents.map((doc) => (
					<Card
						key={doc.id}
						className="bg-white transition-shadow hover:shadow-md dark:bg-slate-800 border-slate-200 dark:border-slate-700"
					>
						<CardContent className="p-4">
							<div className="flex justify-between items-start mb-3">
								<FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(doc, "document")}
										className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
									>
										<Edit className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onDelete(doc.id, "document")}
										className="text-red-600 border-red-300 dark:border-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
							<h4 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
								{doc.name}
							</h4>
							<p className="text-xs text-slate-500 dark:text-slate-500">
								Created: {new Date(doc.createdAt).toLocaleDateString()}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

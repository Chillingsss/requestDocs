import React from "react";
import { Button } from "../../../../components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteConfirmModal({
	showModal,
	deletingItem,
	onConfirm,
	onCancel,
}) {
	if (!showModal) return null;

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
			<div className="p-6 mx-4 w-full max-w-md bg-white rounded-lg dark:bg-slate-800">
				<div className="text-center">
					<div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full dark:bg-red-900">
						<Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
					</div>
					<h3 className="mb-2 text-lg font-semibold">Confirm Deletion</h3>
					<p className="mb-6 text-slate-600 dark:text-slate-400">
						Are you sure you want to delete this {deletingItem?.type || "item"}
						{deletingItem?.name ? ` "${deletingItem.name}"` : ""}? This action
						cannot be undone.
					</p>
					<div className="flex gap-3 justify-center">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={onConfirm}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

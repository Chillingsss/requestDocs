import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function PurposeTab({
	purposes,
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

	return (
		<div className="space-y-4">
			{/* Header with Add Button */}
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
					Purposes
				</h3>
				<button
					onClick={() => onAdd("purpose")}
					className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white bg-blue-600 rounded-md border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					<Plus className="mr-2 w-4 h-4" />
					Add Purpose
				</button>
			</div>

			{/* Table */}
			<div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-slate-800">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
						<thead className="bg-slate-50 dark:bg-slate-700">
							<tr>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									Purpose Name
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									Document
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									Created On
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500 dark:text-slate-300">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y dark:bg-slate-800 divide-slate-200 dark:divide-slate-700">
							{purposes.length === 0 ? (
								<tr>
									<td
										colSpan="4"
										className="px-6 py-4 text-sm text-center text-slate-500 dark:text-slate-400"
									>
										No purposes found. Click "Add Purpose" to get started.
									</td>
								</tr>
							) : (
								purposes.map((purpose) => (
									<tr
										key={purpose.id}
										className="hover:bg-slate-50 dark:hover:bg-slate-700"
									>
										<td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900 dark:text-slate-100">
											{purpose.name}
										</td>
										<td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">
											{purpose.documentName}
										</td>
										<td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">
											{new Date(purpose.createdAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
											<div className="flex justify-end space-x-2">
												<button
													onClick={() => onEdit(purpose, "purpose")}
													className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
												>
													<Edit className="w-4 h-4" />
												</button>
												<button
													onClick={() => onDelete(purpose.id, "purpose")}
													className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

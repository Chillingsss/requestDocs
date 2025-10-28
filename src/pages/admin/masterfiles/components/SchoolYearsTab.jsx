import React from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function SchoolYearsTab({
	schoolYears,
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
					School Years
				</h3>
				<button
					onClick={() => onAdd("schoolYear")}
					className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white bg-blue-600 rounded-md border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					<Plus className="mr-2 w-4 h-4" />
					Add School Year
				</button>
			</div>

			{/* Table */}
			<div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-slate-800">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
						<thead className="bg-slate-50 dark:bg-slate-700">
							<tr>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
									School Year
								</th>
								<th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-500 dark:text-slate-300">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y dark:bg-slate-800 divide-slate-200 dark:divide-slate-700">
							{schoolYears.length === 0 ? (
								<tr>
									<td
										colSpan="2"
										className="px-6 py-4 text-sm text-center text-slate-500 dark:text-slate-400"
									>
										No school years found. Click "Add School Year" to get started.
									</td>
								</tr>
							) : (
								schoolYears.map((schoolYear) => (
									<tr
										key={schoolYear.id}
										className="hover:bg-slate-50 dark:hover:bg-slate-700"
									>
										<td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900 dark:text-slate-100">
											{schoolYear.year}
										</td>
										<td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
											<div className="flex justify-end space-x-2">
												<button
													onClick={() => onEdit(schoolYear, "schoolYear")}
													className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
												>
													<Edit className="w-4 h-4" />
												</button>
												<button
													onClick={() => onDelete(schoolYear.id, "schoolYear")}
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

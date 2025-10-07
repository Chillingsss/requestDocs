import React, { useState } from "react";
import { Trash2, Plus, Edit, X, Check } from "lucide-react";

export default function DocumentRequirementsTab({
	documentRequirements,
	documents,
	requirementTypes,
	loading,
	onAdd,
	onDelete,
	onUpdate,
	userId,
}) {
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingDocument, setEditingDocument] = useState(null);
	const [editFormData, setEditFormData] = useState({
		documentId: "",
		requirementTypeIds: [],
	});

	if (loading) {
		return (
			<div className="py-8 text-center text-slate-600 dark:text-slate-400">
				Loading...
			</div>
		);
	}

	// Group requirements by document
	const groupedRequirements = documentRequirements.reduce((acc, item) => {
		if (!acc[item.documentId]) {
			acc[item.documentId] = {
				documentId: item.documentId,
				documentName: item.documentName,
				requirements: [],
				createdAt: item.createdAt,
			};
		}
		acc[item.documentId].requirements.push({
			id: item.id,
			requirementTypeName: item.requirementTypeName,
			createdAt: item.createdAt,
		});
		return acc;
	}, {});

	const groupedArray = Object.values(groupedRequirements);

	const handleRowClick = (group) => {
		setEditingDocument(group);
		setEditFormData({
			documentId: group.documentId,
			requirementTypeIds: group.requirements
				.map((req) => {
					// Find the requirement type ID from the requirementTypes array
					const reqType = requirementTypes.find(
						(rt) => rt.nameType === req.requirementTypeName
					);
					return reqType ? reqType.id : null;
				})
				.filter(Boolean),
		});
		setShowEditModal(true);
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();

		if (onUpdate) {
			const success = await onUpdate(
				editFormData.documentId,
				editFormData.requirementTypeIds,
				userId
			);

			if (success) {
				setShowEditModal(false);
				setEditingDocument(null);
			}
		} else {
			// Fallback - just close the modal
			setShowEditModal(false);
			setEditingDocument(null);
		}
	};

	const handleDeleteDocument = () => {
		if (
			editingDocument &&
			window.confirm(
				`Are you sure you want to delete all requirements for "${editingDocument.documentName}"?`
			)
		) {
			// Delete all requirements for this document
			editingDocument.requirements.forEach((req) => {
				onDelete(req.id);
			});
			setShowEditModal(false);
			setEditingDocument(null);
		}
	};

	return (
		<>
			<div className="space-y-4">
				{/* Header with Add Button */}
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
						Document Requirements
					</h3>
					<button
						onClick={onAdd}
						className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white bg-blue-600 rounded-md border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<Plus className="mr-2 w-4 h-4" />
						Add Requirements
					</button>
				</div>

				{/* Table */}
				<div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-slate-800">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
							<thead className="bg-slate-50 dark:bg-slate-700">
								<tr>
									<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
										Document
									</th>
									<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
										Requirement Types
									</th>
									<th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500 dark:text-slate-300">
										Added On
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y dark:bg-slate-800 divide-slate-200 dark:divide-slate-700">
								{groupedArray.length === 0 ? (
									<tr>
										<td
											colSpan="3"
											className="px-6 py-4 text-sm text-center text-slate-500 dark:text-slate-400"
										>
											No document requirements found. Click "Add Requirements"
											to get started.
										</td>
									</tr>
								) : (
									groupedArray.map((group) => (
										<tr
											key={group.documentId}
											className="transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
											onClick={() => handleRowClick(group)}
										>
											<td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-900 dark:text-slate-100">
												{group.documentName}
											</td>
											<td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
												<div className="space-y-1">
													{group.requirements.map((req) => (
														<div key={req.id} className="flex items-center">
															<span className="flex-1">
																{req.requirementTypeName}
															</span>
														</div>
													))}
												</div>
											</td>
											<td className="px-6 py-4 text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">
												{new Date(group.createdAt).toLocaleDateString()}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Edit Modal */}
			{showEditModal && editingDocument && (
				<div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
					<div className="mx-4 w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-slate-800">
						{/* Header */}
						<div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
							<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
								Edit Requirements for {editingDocument.documentName}
							</h3>
							<button
								onClick={() => {
									setShowEditModal(false);
									setEditingDocument(null);
								}}
								className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Form */}
						<form onSubmit={handleEditSubmit} className="p-6 space-y-4">
							{/* Requirement Types Selection */}
							<div>
								<label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
									Requirement Types
								</label>
								<div className="overflow-y-auto p-2 max-h-48 rounded-md border border-slate-300 dark:border-slate-600">
									{requirementTypes.map((reqType) => (
										<div
											key={reqType.id}
											className="flex items-center p-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
											onClick={() => {
												const currentSelected =
													editFormData.requirementTypeIds || [];
												let newSelected;

												if (currentSelected.includes(reqType.id)) {
													newSelected = currentSelected.filter(
														(id) => id !== reqType.id
													);
												} else {
													newSelected = [...currentSelected, reqType.id];
												}

												setEditFormData({
													...editFormData,
													requirementTypeIds: newSelected,
												});
											}}
										>
											<div
												className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${
													editFormData.requirementTypeIds?.includes(reqType.id)
														? "bg-blue-500 border-blue-500"
														: "border-slate-300 dark:border-slate-600"
												}`}
											>
												{editFormData.requirementTypeIds?.includes(
													reqType.id
												) && <Check className="w-3 h-3 text-white" />}
											</div>
											<span className="text-sm text-slate-700 dark:text-slate-300">
												{reqType.nameType}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Buttons */}
							<div className="flex justify-between pt-4">
								<button
									type="button"
									onClick={handleDeleteDocument}
									className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md border border-transparent hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
								>
									<Trash2 className="inline mr-2 w-4 h-4" />
									Delete All
								</button>
								<div className="flex space-x-3">
									<button
										type="button"
										onClick={() => {
											setShowEditModal(false);
											setEditingDocument(null);
										}}
										className="px-4 py-2 text-sm font-medium bg-white rounded-md border text-slate-700 dark:text-slate-300 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md border border-transparent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									>
										<Edit className="inline mr-2 w-4 h-4" />
										Update
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

import React, { useState } from "react";
import DocumentsTab from "./components/DocumentsTab";
import RequirementTypesTab from "./components/RequirementTypesTab";
import ResourceModal from "./components/ResourceModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import useResources from "./hooks/useResources";
import { getUserIdFromCookie } from "./utils/cookieUtils";

export default function ResourcesContent() {
	const [activeTab, setActiveTab] = useState("documents");
	const {
		documents,
		requirementTypes,
		loading,
		showAddModal,
		showEditModal,
		showDeleteModal,
		editingItem,
		deletingItem,
		modalType,
		formData,
		handleAdd,
		handleEdit,
		handleDelete,
		confirmDelete,
		handleSubmit,
		resetForm,
		setFormData,
		setShowDeleteModal,
		setDeletingItem,
	} = useResources();

	// Get userId from cookie
	const userId = getUserIdFromCookie();

	const handleFormSubmit = (e) => {
		handleSubmit(e, userId);
	};

	return (
		<>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4">
					<h2 className="text-2xl font-bold">Resources Management</h2>
					<p className="text-slate-600 dark:text-slate-400">
						Manage documents and requirement types used in the system
					</p>
				</div>

				{/* Tabs */}
				<div className="border-b border-slate-200 dark:border-slate-700">
					<nav className="flex space-x-8">
						<button
							onClick={() => setActiveTab("documents")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "documents"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							Documents
						</button>
						<button
							onClick={() => setActiveTab("requirement-types")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "requirement-types"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							Requirement Types
						</button>
					</nav>
				</div>

				{/* Tab Content */}
				<div className="mt-6">
					{activeTab === "documents" && (
						<DocumentsTab
							documents={documents}
							loading={loading}
							onAdd={handleAdd}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					)}
					{activeTab === "requirement-types" && (
						<RequirementTypesTab
							requirementTypes={requirementTypes}
							loading={loading}
							onAdd={handleAdd}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					)}
				</div>
			</div>
			{/* Modals */}
			<ResourceModal
				showModal={showAddModal || showEditModal}
				modalType={modalType}
				showEditModal={showEditModal}
				formData={formData}
				onFormDataChange={setFormData}
				onSubmit={handleFormSubmit}
				onCancel={resetForm}
			/>

			<DeleteConfirmModal
				showModal={showDeleteModal}
				deletingItem={deletingItem}
				onConfirm={confirmDelete}
				onCancel={() => {
					setShowDeleteModal(false);
					setDeletingItem(null);
				}}
			/>
		</>
	);
}

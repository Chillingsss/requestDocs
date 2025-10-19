import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import DocumentsTab from "./components/DocumentsTab";
import RequirementTypesTab from "./components/RequirementTypesTab";
import DocumentRequirementsTab from "./components/DocumentRequirementsTab";
import PurposeTab from "./components/PurposeTab";
import GradeLevelsTab from "./components/GradeLevelsTab";
import SectionsTab from "./components/SectionsTab";
import ResourceModal from "./components/ResourceModal";
import PurposeModal from "./components/PurposeModal";
import DocumentRequirementModal from "./components/DocumentRequirementModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import useResources from "./hooks/useResources";
import { getUserIdFromCookie } from "./utils/cookieUtils";
import AcademicTypesTab from "./components/AcademicTypesTab";
import AcademicTypeModal from "./components/AcademicTypeModal";
import StrandsTab from "./components/StrandsTab";
import StrandModal from "./components/StrandModal";

export default function ResourcesContent() {
	const [activeTab, setActiveTab] = useState("documents");
	const {
		documents,
		requirementTypes,
		documentRequirements,
		purposes,
		gradeLevels,
		sections,
		academicTypes,
		tracks,
		strands,
		loading,
		showAddModal,
		showEditModal,
		showDeleteModal,
		showDocumentRequirementModal,
		deletingItem,
		modalType,
		formData,
		documentRequirementForm,
		handleAdd,
		handleEdit,
		handleDelete,
		handleAddDocumentRequirement,
		handleDeleteDocumentRequirement,
		handleUpdateDocumentRequirements,
		confirmDelete,
		handleSubmit,
		handleDocumentRequirementSubmit,
		resetForm,
		setFormData,
		setDocumentRequirementForm,
		setShowDeleteModal,
		setDeletingItem,
		setShowDocumentRequirementModal,
		setShowAddModal,
		setShowEditModal,
	} = useResources();

	// Get userId from cookie
	const userId = getUserIdFromCookie();

	// Debug logging
	console.log("ResourcesContent - userId from cookie:", userId);

	const handleFormSubmit = (e) => {
		e.preventDefault();
		handleSubmit(e, userId);
	};

	const handleDocumentRequirementFormSubmit = (e) => {
		console.log(
			"handleDocumentRequirementFormSubmit called with userId:",
			userId
		);
		handleDocumentRequirementSubmit(e, userId);
	};

	return (
		<>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold text-slate-900 dark:text-white">
							Resources Management
						</h2>
						<p className="text-slate-600 dark:text-slate-400">
							Manage documents, requirement types, document requirements,
							purposes, grade levels, sections, and strands used in the system
						</p>
					</div>
					<button
						onClick={useResources.fetchData}
						className="p-2 bg-white rounded-lg border shadow-sm transition-colors dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
						title="Refresh Data"
					>
						<RefreshCw className="w-5 h-5" />
					</button>
				</div>

				{/* Tabs */}
				<div className="relative border-b border-slate-200 dark:border-slate-700">
					{/* Gradient fade indicators for mobile scrolling */}
					<div className="absolute top-0 bottom-0 left-0 z-10 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none dark:from-slate-900 sm:hidden"></div>
					<div className="absolute top-0 right-0 bottom-0 z-10 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none dark:from-slate-900 sm:hidden"></div>

					<nav className="flex overflow-x-auto pb-1 space-x-4 sm:space-x-8 scrollbar-hide">
						<button
							onClick={() => setActiveTab("documents")}
							className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
								activeTab === "documents"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
							}`}
						>
							Documents
						</button>
						<button
							onClick={() => setActiveTab("requirement-types")}
							className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
								activeTab === "requirement-types"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
							}`}
						>
							Requirement Types
						</button>
						<button
							onClick={() => setActiveTab("document-requirements")}
							className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
								activeTab === "document-requirements"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
							}`}
						>
							Document Requirements
						</button>
						<button
							onClick={() => setActiveTab("purposes")}
							className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
								activeTab === "purposes"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
							}`}
						>
							Purposes
						</button>
						<button
							onClick={() => setActiveTab("academic-types")}
							className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
								activeTab === "academic-types"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
							}`}
						>
							Academic Types
						</button>
						<button
							onClick={() => setActiveTab("grade-levels")}
							className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
								activeTab === "grade-levels"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
							}`}
						>
							Grade Levels
						</button>
						<button
							onClick={() => setActiveTab("sections")}
							className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
								activeTab === "sections"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
							}`}
						>
							Sections
						</button>
						<button
							onClick={() => setActiveTab("strands")}
							className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
								activeTab === "strands"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
							}`}
						>
							Strands
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
					{activeTab === "document-requirements" && (
						<DocumentRequirementsTab
							documentRequirements={documentRequirements}
							documents={documents}
							requirementTypes={requirementTypes}
							loading={loading}
							onAdd={handleAddDocumentRequirement}
							onDelete={handleDeleteDocumentRequirement}
							onUpdate={handleUpdateDocumentRequirements}
							userId={userId}
						/>
					)}
					{activeTab === "purposes" && (
						<PurposeTab
							purposes={purposes}
							documents={documents}
							loading={loading}
							onAdd={handleAdd}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					)}
					{activeTab === "grade-levels" && (
						<GradeLevelsTab
							gradeLevels={gradeLevels}
							loading={loading}
							onAdd={handleAdd}
							onEdit={handleEdit}
							onDelete={handleDelete}
							academicTypes={academicTypes}
						/>
					)}
					{activeTab === "sections" && (
						<SectionsTab
							sections={sections}
							gradeLevels={gradeLevels}
							loading={loading}
							onAdd={handleAdd}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					)}
					{activeTab === "academic-types" && (
						<AcademicTypesTab
							academicTypes={academicTypes}
							loading={loading}
							onAdd={handleAdd}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					)}
					{activeTab === "strands" && (
						<StrandsTab
							strands={strands}
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
				showModal={
					(showAddModal || showEditModal) &&
					!["purpose", "academicType", "strand"].includes(modalType)
				}
				modalType={modalType}
				showEditModal={showEditModal}
				formData={formData}
				gradeLevels={gradeLevels}
				onFormDataChange={setFormData}
				onSubmit={handleFormSubmit}
				onCancel={resetForm}
				academicTypes={academicTypes}
			/>

			{/* Academic Type Modal */}
			<AcademicTypeModal
				showModal={
					(showAddModal || showEditModal) && modalType === "academicType"
				}
				onClose={resetForm}
				onSubmit={handleFormSubmit}
				formData={formData}
				onFormDataChange={setFormData}
				showEditModal={showEditModal}
				loading={loading}
			/>

			{/* Strand Modal */}
			<StrandModal
				showModal={(showAddModal || showEditModal) && modalType === "strand"}
				onClose={resetForm}
				onSubmit={handleFormSubmit}
				formData={formData}
				onFormDataChange={setFormData}
				showEditModal={showEditModal}
				loading={loading}
				tracks={tracks}
			/>

			<PurposeModal
				showModal={(showAddModal || showEditModal) && modalType === "purpose"}
				modalType={modalType}
				showEditModal={showEditModal}
				formData={formData}
				documents={documents}
				onFormDataChange={setFormData}
				onSubmit={handleFormSubmit}
				onCancel={resetForm}
			/>

			<DocumentRequirementModal
				showModal={showDocumentRequirementModal}
				documents={documents}
				requirementTypes={requirementTypes}
				formData={documentRequirementForm}
				onFormDataChange={setDocumentRequirementForm}
				onSubmit={handleDocumentRequirementFormSubmit}
				onCancel={() => {
					setShowDocumentRequirementModal(false);
					setDocumentRequirementForm({
						documentId: "",
						requirementTypeIds: [],
					});
				}}
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

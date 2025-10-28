import React from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../../components/ui/select";

export default function ResourceModal({
	showModal,
	modalType,
	showEditModal,
	formData,
	gradeLevels = [],
	academicTypes = [],
	onFormDataChange,
	onSubmit,
	onCancel,
}) {
	if (!showModal) return null;

	const getTitle = () => {
		const action = showEditModal ? "Edit" : "Add";
		switch (modalType) {
			case "document":
				return `${action} Document`;
			case "requirement":
				return `${action} Requirement Type`;
			case "gradeLevel":
				return `${action} Grade Level`;
			case "section":
				return `${action} Section`;
			case "academicType":
				return `${action} Academic Type`;
			case "schoolYear":
				return `${action} School Year`;
			default:
				return `${action} Item`;
		}
	};

	const getLabel = () => {
		switch (modalType) {
			case "document":
				return "Document Name";
			case "requirement":
				return "Requirement Type Name";
			case "gradeLevel":
				return "Grade Level Name";
			case "section":
				return "Section Name";
			case "academicType":
				return "Academic Type Name";
			case "schoolYear":
				return "School Year";
			default:
				return "Name";
		}
	};

	const getPlaceholder = () => {
		switch (modalType) {
			case "document":
				return "Enter document name";
			case "requirement":
				return "Enter requirement type name";
			case "gradeLevel":
				return "Enter grade level name";
			case "section":
				return "Enter section name";
			case "academicType":
				return "Enter academic type name";
			case "schoolYear":
				return "Enter school year (e.g., 2024-2025)";
			default:
				return "Enter name";
		}
	};

	return (
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-40">
			<div className="relative mx-4 w-full max-w-md bg-white rounded-lg border shadow-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<form onSubmit={onSubmit}>
					<div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
						<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
							{getTitle()}
						</h2>
						<button
							type="button"
							className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
							onClick={onCancel}
							aria-label="Close"
						>
							<span className="text-2xl">&times;</span>
						</button>
					</div>
					<div className="px-6 py-4 space-y-4">
						<div>
							<Label
								htmlFor="name"
								className="block mb-1 text-slate-700 dark:text-slate-300"
							>
								{getLabel()} <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								value={formData.name || ""}
								onChange={(e) =>
									onFormDataChange({ ...formData, name: e.target.value })
								}
								placeholder={getPlaceholder()}
								className="w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
								required
							/>
						</div>
						{modalType === "gradeLevel" && academicTypes && (
							<div>
								<Label
									htmlFor="academicType"
									className="block mb-1 text-slate-700 dark:text-slate-300"
								>
									Academic Type <span className="text-red-500">*</span>
								</Label>
								<Select
									value={formData.academicTId || ""}
									onValueChange={(value) =>
										onFormDataChange({ ...formData, academicTId: value })
									}
									required
								>
									<SelectTrigger className="w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
										<SelectValue placeholder="Select an academic type" />
									</SelectTrigger>
									<SelectContent className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
										{academicTypes.map((academicType) => (
											<SelectItem
												key={academicType.id}
												value={academicType.id}
												className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600"
											>
												{academicType.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
						{modalType === "section" && gradeLevels && (
							<div>
								<Label
									htmlFor="gradeLevel"
									className="block mb-1 text-slate-700 dark:text-slate-300"
								>
									Grade Level <span className="text-red-500">*</span>
								</Label>
								<Select
									value={formData.gradeLevelId || ""}
									onValueChange={(value) =>
										onFormDataChange({ ...formData, gradeLevelId: value })
									}
									required
								>
									<SelectTrigger className="w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
										<SelectValue placeholder="Select a grade level" />
									</SelectTrigger>
									<SelectContent className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
										{gradeLevels.map((gradeLevel) => (
											<SelectItem
												key={gradeLevel.id}
												value={gradeLevel.id}
												className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600"
											>
												{gradeLevel.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
					<div className="flex gap-2 justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-700">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="text-white bg-blue-600 hover:bg-blue-700"
						>
							{showEditModal ? "Update" : "Add"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

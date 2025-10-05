import React from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

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
			default:
				return "Enter name";
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
				<h3 className="text-lg font-semibold mb-4">
					{getTitle()}
				</h3>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<Label htmlFor="name">
							{getLabel()}
						</Label>
						<Input
							id="name"
							value={formData.name || ""}
							onChange={(e) =>
								onFormDataChange({ ...formData, name: e.target.value })
							}
							placeholder={getPlaceholder()}
							required
						/>
					</div>
					{modalType === "gradeLevel" && academicTypes && (
            <div>
              <Label htmlFor="academicType">Academic Type</Label>
              <Select
                value={formData.academicTId || ""}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, academicTId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an academic type" />
                </SelectTrigger>
                <SelectContent>
                  {academicTypes.map((academicType) => (
										<SelectItem key={academicType.id} value={academicType.id}>
											{academicType.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					{modalType === "section" && gradeLevels && (
            <div>
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Select
                value={formData.gradeLevelId || ""}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, gradeLevelId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a grade level" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((gradeLevel) => (
										<SelectItem key={gradeLevel.id} value={gradeLevel.id}>
											{gradeLevel.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					<div className="flex gap-3 justify-end">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button type="submit">{showEditModal ? "Update" : "Add"}</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

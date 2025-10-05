import React from "react";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";

export default function AcademicTypeModal({
	showModal,
	onClose,
	onSubmit,
	formData = { name: "", description: "" },
	onFormDataChange,
	showEditModal,
	loading,
}) {
	const handleChange = (e) => {
		const { name, value } = e.target;
		onFormDataChange({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(e);
	};

	if (!showModal) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 relative">
				<form onSubmit={handleSubmit}>
					<div className="border-b px-6 py-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold">
							{showEditModal ? "Edit Academic Type" : "Add New Academic Type"}
						</h2>
						<button
							type="button"
							className="text-gray-400 hover:text-gray-600"
							onClick={onClose}
							aria-label="Close"
						>
							<span className="text-2xl">&times;</span>
						</button>
					</div>
					<div className="px-6 py-4 space-y-4">
						<div>
							<Label htmlFor="name" className="block mb-1">
								Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name || ""}
								onChange={handleChange}
								className="w-full"
								required
							/>
						</div>
					</div>
					<div className="flex justify-end gap-2 border-t px-6 py-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

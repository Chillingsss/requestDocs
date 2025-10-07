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
		<div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-40">
			<div className="relative mx-4 w-full max-w-md bg-white rounded-lg border shadow-lg dark:bg-slate-800 border-slate-200 dark:border-slate-700">
				<form onSubmit={handleSubmit}>
					<div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
						<h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
							{showEditModal ? "Edit Academic Type" : "Add New Academic Type"}
						</h2>
						<button
							type="button"
							className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
							onClick={onClose}
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
								Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name || ""}
								onChange={handleChange}
								className="w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
								placeholder="Enter academic type name"
								required
							/>
						</div>
					</div>
					<div className="flex gap-2 justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-700">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={loading}
							className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading}
							className="text-white bg-blue-600 hover:bg-blue-700"
						>
							{loading ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

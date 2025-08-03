import React from "react";
import { FileText, Paperclip } from "lucide-react";
import { getDecryptedApiUrl } from "../../../utils/apiConfig";

const AttachmentsSection = ({
	attachments,
	groupByType,
	setGroupByType,
	openImageZoom,
	isImageFile,
}) => {
	const apiUrl = getDecryptedApiUrl();

	const groupAttachmentsByType = () => {
		const grouped = {};
		attachments.forEach((attachment) => {
			const type = attachment.requirementType || "Unknown Type";
			if (!grouped[type]) {
				grouped[type] = [];
			}
			grouped[type].push(attachment);
		});
		return grouped;
	};

	if (attachments.length === 0) return null;

	return (
		<div className="p-4 rounded-lg bg-slate-50">
			<div className="flex justify-between items-center mb-4">
				<div className="flex gap-3 items-center">
					<Paperclip className="w-5 h-5 text-blue-600" />
					<span className="text-sm font-medium text-slate-600">
						Attachments ({attachments.length})
					</span>
				</div>
				<button
					onClick={() => setGroupByType(!groupByType)}
					className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full border border-blue-200 transition-colors hover:bg-blue-100"
				>
					{groupByType ? "List View" : "Group by Type"}
				</button>
			</div>

			{groupByType ? (
				// Grouped view by requirement type
				<div className="space-y-4">
					{Object.entries(groupAttachmentsByType()).map(
						([type, typeAttachments]) => (
							<div
								key={type}
								className="overflow-hidden rounded-lg border border-slate-200"
							>
								<div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200">
									<h4 className="text-sm font-semibold tracking-wide text-indigo-800 uppercase">
										{type} ({typeAttachments.length})
									</h4>
								</div>
								<div className="p-3">
									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
										{typeAttachments.map((attachment, index) => (
											<div
												key={`${type}-${index}`}
												className="overflow-hidden bg-white rounded-lg border border-slate-200"
											>
												{isImageFile(attachment.filepath) ? (
													<div>
														<div
															className="flex overflow-hidden justify-center items-center transition-colors cursor-pointer aspect-video bg-slate-100 hover:bg-slate-200"
															onClick={() => openImageZoom(attachment)}
															title="Click to zoom"
														>
															<img
																src={`${apiUrl}/requirements/${attachment.filepath}`}
																alt={attachment.filepath}
																className="object-cover w-full h-full"
																onError={(e) => {
																	e.target.style.display = "none";
																	e.target.parentElement.innerHTML = `
																<div class="flex flex-col justify-center items-center p-4 text-slate-500">
																	<FileText class="mb-2 w-8 h-8" />
																	<span class="text-sm">Failed to load image</span>
																</div>
															`;
																}}
															/>
														</div>
														<div className="p-2">
															<p className="mb-1 text-xs font-medium truncate text-slate-700">
																{attachment.filepath}
															</p>
															<button
																onClick={() => openImageZoom(attachment)}
																className="text-xs font-medium text-blue-600 hover:text-blue-800"
															>
																🔍 Zoom
															</button>
														</div>
													</div>
												) : (
													<div className="flex gap-2 items-center p-3">
														<FileText className="flex-shrink-0 w-6 h-6 text-slate-500" />
														<div className="flex-1 min-w-0">
															<p className="mb-1 text-xs font-medium truncate text-slate-700">
																{attachment.filepath}
															</p>
															<a
																href={`${apiUrl}/requirements/${attachment.filepath}`}
																target="_blank"
																rel="noopener noreferrer"
																className="text-xs font-medium text-blue-600 hover:text-blue-800"
															>
																📄 Open
															</a>
														</div>
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							</div>
						)
					)}
				</div>
			) : (
				// Regular grid view
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{attachments.map((attachment, index) => (
						<div
							key={index}
							className="overflow-hidden bg-white rounded-lg border shadow-sm border-slate-200"
						>
							{/* Requirement Type Header */}
							<div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
								<p className="text-xs font-semibold tracking-wide text-blue-800 uppercase">
									{attachment.requirementType || "Unknown Type"}
								</p>
							</div>

							{isImageFile(attachment.filepath) ? (
								<div>
									<div
										className="flex overflow-hidden justify-center items-center transition-colors cursor-pointer aspect-video bg-slate-100 hover:bg-slate-200"
										onClick={() => openImageZoom(attachment)}
										title="Click to zoom"
									>
										<img
											src={`${apiUrl}/requirements/${attachment.filepath}`}
											alt={attachment.filepath}
											className="object-cover w-full h-full"
											onError={(e) => {
												e.target.style.display = "none";
												e.target.parentElement.innerHTML = `
											<div class="flex flex-col justify-center items-center p-4 text-slate-500">
												<FileText class="mb-2 w-8 h-8" />
												<span class="text-sm">Failed to load image</span>
											</div>
										`;
											}}
										/>
									</div>
									<div className="p-3">
										<p className="mb-1 text-sm font-medium truncate text-slate-700">
											{attachment.filepath}
										</p>
										<button
											onClick={() => openImageZoom(attachment)}
											className="text-xs font-medium text-blue-600 hover:text-blue-800"
										>
											🔍 Click to Zoom
										</button>
									</div>
								</div>
							) : (
								<div className="flex gap-3 items-center p-4">
									<FileText className="flex-shrink-0 w-8 h-8 text-slate-500" />
									<div className="flex-1 min-w-0">
										<p className="mb-1 text-sm font-medium truncate text-slate-700">
											{attachment.filepath}
										</p>
										<a
											href={`${apiUrl}/requirements/${attachment.filepath}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
										>
											📄 Open Document
										</a>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default AttachmentsSection;

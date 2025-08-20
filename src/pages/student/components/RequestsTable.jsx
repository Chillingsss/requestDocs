import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { FileText, Plus, Calendar } from "lucide-react";
import InlineTrackingProgress from "./InlineTrackingProgress";

const RequestsTable = ({
	userRequests,
	loadingRequests,
	onRequestFormOpen,
}) => {
	return (
		<Card className="shadow-sm dark:bg-slate-800 dark:border-slate-700">
			<CardContent className="p-0">
				<div className="p-4 border-b border-gray-100 dark:border-slate-700 sm:p-6">
					<h2 className="text-lg font-semibold lg:text-xl">
						My Document Requests
					</h2>
				</div>

				{loadingRequests ? (
					<div className="py-8 text-center lg:py-12">
						<div className="inline-flex gap-2 items-center text-sm text-slate-500 lg:text-base">
							<div className="w-4 h-4 rounded-full border-2 border-blue-600 animate-spin border-t-transparent"></div>
							Loading your requests...
						</div>
					</div>
				) : userRequests.length === 0 ? (
					<div className="py-8 text-center lg:py-12">
						<FileText className="mx-auto mb-4 w-12 h-12 text-gray-300" />
						<p className="text-sm text-slate-500 lg:text-base">
							No document requests yet.
						</p>
						<Button
							className="mt-4 text-white bg-blue-600 hover:bg-blue-700"
							onClick={onRequestFormOpen}
						>
							<Plus className="mr-2 w-4 h-4" />
							Request Your First Document
						</Button>
					</div>
				) : (
					<div className="overflow-hidden">
						{/* Mobile Card Layout */}
						<div className="block sm:hidden">
							{userRequests.map((req, index) => (
								<div
									key={req.id}
									className={`p-4 space-y-3 ${
										index !== userRequests.length - 1
											? "border-b border-gray-100 dark:border-slate-700"
											: ""
									}`}
								>
									<div className="flex justify-between items-start">
										<div className="flex-1 min-w-0">
											<h3 className="font-medium truncate text-slate-900 dark:text-white">
												{req.document}
											</h3>
											{req.releaseDateFormatted && (
												<div className="flex items-center gap-1 mt-1 text-sm text-green-600 dark:text-green-400">
													<Calendar className="w-3 h-3" />
													<span>Release: {req.releaseDateFormatted}</span>
												</div>
											)}
										</div>
									</div>
									<div className="w-full">
										<InlineTrackingProgress requestId={req.id} />
									</div>
								</div>
							))}
						</div>

						{/* Desktop Table Layout */}
						<div className="hidden overflow-x-auto sm:block">
							<table className="min-w-full text-sm lg:text-base text-slate-700">
								<thead className="bg-gray-50 dark:bg-slate-800">
									<tr className="border-b border-slate-200 dark:border-slate-700">
										<th className="px-4 py-3 font-semibold text-left text-slate-900 dark:text-white">
											Document
										</th>
										<th className="px-4 py-3 font-semibold text-left text-slate-900 dark:text-white">
											Progress
										</th>
										<th className="px-4 py-3 font-semibold text-left text-slate-900 dark:text-white">
											Release Date
										</th>
									</tr>
								</thead>
								<tbody>
									{userRequests.map((req, index) => (
										<tr
											key={req.id}
											className={`transition-colors ${
												index !== userRequests.length - 1
													? "border-b border-slate-100 dark:border-slate-700"
													: ""
											}`}
										>
											<td className="px-4 py-4">
												<div className="font-medium text-slate-900 dark:text-white">
													{req.document}
												</div>
											</td>
											<td className="px-4 py-4">
												<InlineTrackingProgress requestId={req.id} />
											</td>
											<td className="px-4 py-4">
												{req.releaseDateFormatted ? (
													<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
														<Calendar className="w-4 h-4" />
														<span className="font-medium">
															{req.releaseDateFormatted}
														</span>
													</div>
												) : (
													<span className="text-slate-400 dark:text-slate-500 italic">
														Not scheduled yet
													</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default RequestsTable;

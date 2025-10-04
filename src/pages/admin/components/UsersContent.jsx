import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";

export default function UsersContent({
	users,
	loading,
	onAddUser,
	onViewProfile,
	onActivateUser,
	onDeactivateUser,
}) {
	return (
		<>
			{/* Users List */}
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="flex justify-between items-center mb-4">
						<div className="text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
							Users Management
						</div>
						<div className="flex gap-2">
							<Button
								onClick={onAddUser}
								className="text-white bg-blue-600 hover:bg-blue-700"
							>
								<Plus className="mr-2 w-4 h-4" />
								Add User
							</Button>
						</div>
					</div>

					{loading ? (
						<div className="py-8 text-center text-slate-500 dark:text-slate-400">
							Loading users...
						</div>
					) : users.length === 0 ? (
						<div className="py-8 text-center text-slate-500 dark:text-slate-400">
							No users found
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-slate-200 dark:border-slate-600">
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											User ID
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Name
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Email
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											User Level
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Status
										</th>
									</tr>
								</thead>
								<tbody>
									{users.map((user, index) => (
										<tr
											key={user.id}
											className={`border-b border-slate-100 dark:border-slate-600 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-600 ${
												index % 2 === 0
													? "bg-slate-50 dark:bg-slate-700"
													: "bg-white dark:bg-slate-700"
											}`}
										>
											<td
												className="px-4 py-3 text-sm text-slate-900 dark:text-white cursor-pointer"
												onClick={() => onViewProfile(user.id, "user")}
											>
												{user.id}
											</td>
											<td
												className="px-4 py-3 text-sm text-slate-900 dark:text-white cursor-pointer"
												onClick={() => onViewProfile(user.id, "user")}
											>
												{user.firstname} {user.lastname}
											</td>
											<td
												className="px-4 py-3 text-sm text-slate-900 dark:text-white cursor-pointer"
												onClick={() => onViewProfile(user.id, "user")}
											>
												{user.email}
											</td>
											<td
												className="px-4 py-3 text-sm text-slate-900 dark:text-white cursor-pointer"
												onClick={() => onViewProfile(user.id, "user")}
											>
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
													{user.userLevel}
												</span>
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												<div className="flex items-center justify-between gap-3 min-w-[160px]">
													<span
														className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-medium min-w-[72px] ${
															user.isActive
																? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
																: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
														}`}
													>
														{user.isActive ? "Active" : "Inactive"}
													</span>
													<label className="relative inline-flex items-center cursor-pointer">
														<input
															type="checkbox"
															checked={user.isActive}
															onChange={(e) => {
																e.stopPropagation();
																if (user.isActive) {
																	onDeactivateUser(user.id, "user");
																} else {
																	onActivateUser(user.id, "user");
																}
															}}
															className="sr-only peer"
														/>
														<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
													</label>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}

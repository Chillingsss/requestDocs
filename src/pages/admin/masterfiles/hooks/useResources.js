import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
	getDocuments,
	getRequirementTypes,
	addDocument,
	addRequirementType,
	updateDocument,
	updateRequirementType,
	deleteDocument,
	deleteRequirementType,
} from "../../../../utils/admin";

export default function useResources() {
	const [documents, setDocuments] = useState([]);
	const [requirementTypes, setRequirementTypes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [deletingItem, setDeletingItem] = useState(null);
	const [modalType, setModalType] = useState("");
	const [formData, setFormData] = useState({ name: "" });

	const fetchData = async () => {
		setLoading(true);
		try {
			const [docsData, reqTypesData] = await Promise.all([
				getDocuments(),
				getRequirementTypes(),
			]);

			setDocuments(Array.isArray(docsData) ? docsData : []);
			setRequirementTypes(Array.isArray(reqTypesData) ? reqTypesData : []);
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Failed to load resources");
			setDocuments([]);
			setRequirementTypes([]);
		} finally {
			setLoading(false);
		}
	};

	const handleAdd = (type) => {
		setModalType(type);
		setFormData({ name: "" });
		setShowAddModal(true);
	};

	const handleEdit = (item, type) => {
		setModalType(type);
		setEditingItem(item);
		setFormData({
			name: type === "document" ? item.name : item.nameType,
		});
		setShowEditModal(true);
	};

	const handleDelete = (id, type) => {
		setDeletingItem({ id, type });
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!deletingItem) return;

		try {
			let result;
			if (deletingItem.type === "document") {
				result = await deleteDocument(deletingItem.id);
			} else {
				result = await deleteRequirementType(deletingItem.id);
			}

			if (result && result.status === "success") {
				toast.success(
					`${
						deletingItem.type === "document" ? "Document" : "Requirement type"
					} deleted successfully`
				);
				fetchData();
			} else {
				toast.error(result?.message || "Failed to delete item");
			}
		} catch (error) {
			console.error("Error deleting item:", error);
			toast.error("Failed to delete item");
		} finally {
			setShowDeleteModal(false);
			setDeletingItem(null);
		}
	};

	const handleSubmit = async (e, userId) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast.error("Name is required");
			return;
		}

		const submitData = {
			...formData,
			userId: userId || null,
		};

		try {
			let result;
			if (showEditModal) {
				if (modalType === "document") {
					result = await updateDocument(editingItem.id, submitData);
				} else {
					result = await updateRequirementType(editingItem.id, submitData);
				}
			} else {
				if (modalType === "document") {
					result = await addDocument(submitData);
				} else {
					result = await addRequirementType(submitData);
				}
			}

			if (result && result.status === "success") {
				toast.success(
					`${modalType === "document" ? "Document" : "Requirement type"} ${
						showEditModal ? "updated" : "added"
					} successfully`
				);
				setShowAddModal(false);
				setShowEditModal(false);
				fetchData();
			} else {
				toast.error(result?.message || "Failed to save item");
			}
		} catch (error) {
			console.error("Error saving item:", error);
			toast.error("Failed to save item");
		}
	};

	const resetForm = () => {
		setFormData({ name: "" });
		setEditingItem(null);
		setShowAddModal(false);
		setShowEditModal(false);
		setShowDeleteModal(false);
		setDeletingItem(null);
	};

	useEffect(() => {
		fetchData();
	}, []);

	return {
		// State
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
		// Actions
		handleAdd,
		handleEdit,
		handleDelete,
		confirmDelete,
		handleSubmit,
		resetForm,
		setFormData,
		// Setters for modals
		setShowDeleteModal,
		setDeletingItem,
	};
}

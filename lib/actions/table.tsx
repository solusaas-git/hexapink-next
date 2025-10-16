import { toast } from "react-toastify";
import api, { formApi } from "./api";

// Action to create a table
export const createTable = async (
  fileData: FormData,
  onSuccess: () => void
) => {
  try {
    await formApi.post("/api/table/create", fileData);
    onSuccess();
    toast.success("Successfully created table.");
  } catch (error: any) {
    handleError(error, "Unable to create table.");
  }
};

// Action to update the table name
export const updateTableName = async (
  tableId: string,
  updatedData: { tableName: string },
  onSuccess: () => void
) => {
  try {
    await api.put(`/api/table/update/${tableId}`, updatedData);
    onSuccess();
    toast.success("Table name updated successfully.");
  } catch (error: any) {
    handleError(error, "Unable to update table name.");
  }
};

// Action to update tags for a table
export const updateTableTags = async (
  tableId: string,
  updatedData: { tags: string[] },
  onSuccess: () => void
) => {
  try {
    await api.put(
      `/api/table/updateTags/${tableId}`,
      updatedData
    );
    onSuccess();
    toast.success("Tags updated successfully.");
  } catch (error: any) {
    handleError(error, "Unable to update tags.");
  }
};

// Action to delete a table by ID
export const deleteTableById = async (id: string, onSuccess: () => void) => {
  try {
    await api.delete(`/api/table/delete/${id}`);
    onSuccess();
    toast.success("Table deleted successfully.");
  } catch (error: any) {
    handleError(error, "Unable to delete table.");
  }
};

// Action to add a tag
export const addTag = async (tableId: string, tag: string, onSuccess: () => void) => {
  try {
    await api.post(`/api/table/addTag/${tableId}`, { tag });
    onSuccess();
  } catch (error: any) {
    handleError(error, "Unable to add tag.");
  }
};

// Action to update a tag
export const updateTag = async (tableId: string, oldTag: string, newTag: string, onSuccess: () => void) => {
  try {
    await api.put(`/api/table/updateTag/${tableId}`, { oldTag, newTag });
    onSuccess();
  } catch (error: any) {
    handleError(error, "Unable to update tag.");
  }
};

// Action to delete a tag
export const deleteTag = async (tableId: string, tag: string, onSuccess: () => void) => {
  try {
    await api.delete(`/api/table/deleteTag/${tableId}`, { data: { tag } });
    onSuccess();
  } catch (error: any) {
    handleError(error, "Unable to delete tag.");
  }
};

// Error handling function
const handleError = (error: any, defaultMessage: string) => {
  console.error("Error:", error);
  if (error.response) {
    toast.error(`Error: ${error.response.data.message}`);
  } else if (error.request) {
    toast.error("Error: No response from server. Please try again later.");
  } else {
    toast.error(defaultMessage);
  }
};

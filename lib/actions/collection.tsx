import { Collection } from "@/types";
import api from "./api";

export const getTotalLeads = async (data: Collection) => {
  const tableIds = data.columns.flatMap((column) =>
    column.tableColumns?.flatMap((tableColumn) => tableColumn.tableId)
  );
  const uniqueTableIds = [...new Set(tableIds)];

  const response = await api.post("/api/table/total-leads", {
    tableIds: uniqueTableIds,
  });
  return response.data.totalLeads;
};


export const updateCollection = async (id: string, data: Collection) => {
  try {
    const response = await api.patch(`/api/collection/update/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
}
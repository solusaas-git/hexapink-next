import api from "./api";


export const updateStatus = async (
  id: string,
  status: string,
  onSuccess: () => void
) => {
  try {
    const response = await api.put(`/api/bank/update-status/${id}`, {
      status,
    });
    if (response.status === 200) {
      onSuccess();
    }
  } catch (error: any) {
    console.error("Error updating user status:", error);
    if (error.response) {
      alert(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      alert("Error: No response from server. Please try again later.");
    } else {
      alert("Error: Unable to update user status. Please try again.");
    }
  }
};

import axios from "axios";
import toast from "react-hot-toast";
// refresh the state
const refreshState = () => {
  window.location.reload();
};

// logout the user and refresh the state
export const Logout = async () => {
  try {
    await axios.get("/api/users/logout");
    toast.success("Logout successful");
    refreshState();
  } catch (error) {
    console.log(error.message);
    toast.error(error.message);
  }
};

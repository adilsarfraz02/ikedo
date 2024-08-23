import axios from "axios";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export const Logout = async () => {
  const router = useRouter();
  try {
    await axios.get("/api/users/logout");
    toast.success("Logout successful");
    router.push("/auth/login");
  } catch (error) {
    console.log(error.message);
    toast.error(error.message);
  }
};

import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";
import { toast } from "react-toastify";

export default function Login() {
  const onSuccess = (cred) => {
    const user = jwtDecode(cred.credential); // { name, email, picture, sub, ... }
    localStorage.setItem("user", JSON.stringify(user));
    toast.success(`Welcome ${user.name}`);
    window.location.reload();
  };

  const onError = () => toast.error("Google Sign-In failed");

  return <GoogleLogin onSuccess={onSuccess} onError={onError} />;
}

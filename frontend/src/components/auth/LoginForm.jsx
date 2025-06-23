// frontend/src/components/auth/LoginForm.jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../utils/validationSchemas.js.js";
import useAuth from "../../hooks/useAuth.js";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import "./LoginForm.css";
import { Link } from "react-router-dom";

const LoginForm = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    await login(data);
  };

  return (
    <div className="login-form-container" style={{ border: "5px solid green" }}>
      <h2 className="login-form-title">Login to HRMS</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <Input
          label="Email Address"
          type="email"
          error={errors.email?.message}
          {...register("email")}
          placeholder="Enter your email"
        />
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
          placeholder="Enter your password"
        />
        <Button isLoading={isSubmitting}>Login</Button>
          {/* <p className="login-link">
          Don't have an account? <Link to="auth/register">Register</Link>
        </p> */}
        <p className="login-link">Dont have an Account ? <Link to="/auth/register">Register</Link> </p>
      </form>
    </div>
  );
};

export default LoginForm;

import AuthLayout from "@/components/website/auth/AuthLayout";
import LoginForm from "@/components/website/auth/LoginForm";

const LoginPage = () => {
// login page
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Login to continue shopping"
        >
            <LoginForm />
        </AuthLayout>
    );
};

export default LoginPage;
import AuthLayout from "@/components/website/auth/AuthLayout";
import RegisterForm from "@/components/website/auth/RegisterForm";

const RegisterPage = () => {
    // register page
    return (
        <AuthLayout
            title="Create Account"
            subtitle="Register to start shopping"
        >
            <RegisterForm />
        </AuthLayout>
    );
};

export default RegisterPage;
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            padding: '1rem'
        }}>
            <RegisterForm />
        </div>
    );
}
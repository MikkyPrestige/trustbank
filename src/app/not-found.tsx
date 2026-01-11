import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
            <p style={{ marginBottom: '2rem' }}>The requested resource could not be located.</p>
            <Link href="/" style={{ textDecoration: 'underline', color: 'blue' }}>
                Return to Dashboard
            </Link>
        </div>
    );
}
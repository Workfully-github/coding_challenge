import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui'
    }}>
      <h1>Live Session Challenge</h1>
      <p style={{ marginTop: '20px', fontSize: '18px' }}>
        <Link 
          href="/live-session"
          style={{
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          Go to Live Session →
        </Link>
      </p>
    </div>
  );
}

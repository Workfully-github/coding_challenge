'use client';

interface ErrorBannerProps {
  message: string | null;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#ffebee',
      color: '#d32f2f',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #ffcdd2'
    }}>
      <strong>Error:</strong> {message}
    </div>
  );
}

export default function JWSTValidationPage() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <a href="/" style={{ 
          textDecoration: 'none', 
          color: '#0066cc', 
          display: 'block', 
          marginBottom: '20px'
        }}>
          ← Back to Home
        </a>
      </div>
      
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>JWST Validation</h1>
      <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
        This page contains the JWST validation report for FractiVerse 1.0. The full content has been simplified temporarily.
      </p>
      <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
        Please check back later for the complete validation report with all scientific data and findings.
      </p>
    </div>
  )
} 
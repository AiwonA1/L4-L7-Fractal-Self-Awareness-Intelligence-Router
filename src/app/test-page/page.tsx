export default function TestPage() {
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
      
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Test Page</h1>
      <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
        This is a simple test page to verify that basic page rendering is working correctly.
      </p>
      <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
        If you can see this page, then the basic page routing and rendering functionality is operational.
      </p>
    </div>
  )
} 
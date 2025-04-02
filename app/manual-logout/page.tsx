export default function ManualLogoutPage() {
  return (
    <div>
      <h1>Manual Cookie Clearer</h1>
      <div id="result"></div>
      
      <script dangerouslySetInnerHTML={{ __html: `
        // Function to clear all cookies
        function clearAllCookies() {
          try {
            const cookies = document.cookie.split(';');
            document.getElementById('result').innerHTML = '<p>Found ' + cookies.length + ' cookies to clear</p>';
            
            // Get all possible domain combinations
            const hostname = window.location.hostname;
            const domains = [
              '', // no domain
              hostname, // exact domain
              hostname.indexOf('.') !== -1 ? '.' + hostname : hostname, // .domain
              hostname.split('.').slice(1).join('.') // parent domain
            ];
            
            // Clear cookies with all possible domain and path combinations
            let cleared = 0;
            for (const cookie of cookies) {
              const parts = cookie.split('=');
              const name = parts[0].trim();
              
              if (name) {
                // Try all domain/path combinations
                for (const domain of domains) {
                  for (const path of ['/', '/dashboard', '/api', '']) {
                    const domainPart = domain ? '; domain=' + domain : '';
                    const pathPart = path ? '; path=' + path : '';
                    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + domainPart + pathPart;
                  }
                }
                cleared++;
              }
            }
            
            const remainingCookies = document.cookie.split(';').filter(c => c.trim()).length;
            document.getElementById('result').innerHTML += '<p>Cleared ' + cleared + ' cookies.</p>';
            document.getElementById('result').innerHTML += '<p>Remaining cookies: ' + remainingCookies + '</p>';
            
            // Attempt to remove specific NextAuth cookies
            const nextAuthCookies = [
              'next-auth.session-token',
              'next-auth.callback-url',
              'next-auth.csrf-token',
              '__Secure-next-auth.callback-url',
              '__Secure-next-auth.session-token',
              '__Secure-next-auth.csrf-token',
              '__Host-next-auth.csrf-token',
              'auth-token'
            ];
            
            for (const name of nextAuthCookies) {
              for (const domain of domains) {
                for (const path of ['/', '/dashboard', '/api', '']) {
                  const domainPart = domain ? '; domain=' + domain : '';
                  const pathPart = path ? '; path=' + path : '';
                  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + domainPart + pathPart;
                }
              }
            }
            
            document.getElementById('result').innerHTML += '<p>Specifically cleared NextAuth cookies.</p>';
            
            return remainingCookies === 0;
          } catch (error) {
            document.getElementById('result').innerHTML += '<p>Error clearing cookies: ' + error + '</p>';
            return false;
          }
        }
        
        // Run immediately and show results
        clearAllCookies();
        
        // Add a button to go to home
        const homeButton = document.createElement('button');
        homeButton.innerText = 'Go to Home Page';
        homeButton.style.padding = '10px 20px';
        homeButton.style.marginTop = '20px';
        homeButton.style.backgroundColor = '#319795';
        homeButton.style.color = 'white';
        homeButton.style.border = 'none';
        homeButton.style.borderRadius = '5px';
        homeButton.style.cursor = 'pointer';
        
        homeButton.onclick = function() {
          window.location.href = '/?no_auth=1&time=' + new Date().getTime();
        };
        
        document.body.appendChild(homeButton);
        
        // Add a button to go to dashboard with bypass
        const dashboardButton = document.createElement('button');
        dashboardButton.innerText = 'Go to Dashboard (Bypass Auth)';
        dashboardButton.style.padding = '10px 20px';
        dashboardButton.style.marginTop = '20px';
        dashboardButton.style.marginLeft = '10px';
        dashboardButton.style.backgroundColor = '#3182ce';
        dashboardButton.style.color = 'white';
        dashboardButton.style.border = 'none';
        dashboardButton.style.borderRadius = '5px';
        dashboardButton.style.cursor = 'pointer';
        
        dashboardButton.onclick = function() {
          window.location.href = '/dashboard?no_auth=1&time=' + new Date().getTime();
        };
        
        document.body.appendChild(dashboardButton);
      `}} />
    </div>
  );
} 
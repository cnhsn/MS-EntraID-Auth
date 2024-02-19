# Node.js OAuth2 Proxy for Azure AD

This Node.js application acts as an OAuth2 authentication proxy, securing web applications using Azure Active Directory as the identity provider.

## Key Features

*   Leverages `passport` and `passport-azure-ad` to streamline OAuth2/OpenID Connect integration with Azure AD.
*   Enforces authentication on protected routes.
*   Restricts access based on Azure AD group membership (optional).
*   Implements security best practices, including ID token validation and secure session handling.

## Prerequisites

*   A Node.js environment (compatible with the version specified in `package.json`)
*   An Azure Active Directory tenant
*   An application registered within your Azure AD tenant

## Installation

1.  Clone this repository:
    ```bash
    git clone https://github.com/cnhsn/MS-EntraID-Auth.git
    ```

2.  Navigate to the project directory:
    ```bash
    cd MS-EntraID-Auth
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

1. **Create a `.env` file** in the root of the project. **Do not commit this file to version control.** 

2. **Populate `.env` with the following:**

```bash
# Azure AD Authentication
TENANT_ID=your-azure-tenant-id
CLIENT_ID=your-azure-client-id
CLIENT_SECRET=your-secure-client-secret
REDIRECT_URI=http://localhost:3000/auth/callback

# Optional Group Restriction
ALLOWED_GROUPS=group1_object_id,group2_object_id

# Application Settings
PORT=3000
SESSION_SECRET=a-very-long-and-random-secret
```


*   Obtain the `TENANT_ID`, `CLIENT_ID`, and `CLIENT_SECRET` from your Azure AD app registration.
*   Set `REDIRECT_URI` to match your configured callback URL in Azure AD.
*   If using the  `ALLOWED_GROUPS` feature, provide a comma-separated list of Azure AD group object IDs.


## Usage

1.  **Start the application:**
 ```bash
 node app.js
 ```

2.  **Access protected routes:** 
 Routes defined within `app.js` under the `authMiddleware`  will now require Azure AD authentication. 

## Security Considerations

*   **HTTPS:**  In production environments, **enforce HTTPS** using Nginx or similar to protect sensitive data in transit.
*   **Secrets:** **Never** commit your `.env` file. Employ secure environment variable management solutions in production.
*   **Session Security:** Robust session secrets and cookie settings (`secure`, `httpOnly`, `sameSite`) are implemented, but for sensitive applications, consider secure session storage (e.g., Redis).
*   **Regular Updates:**  Stay updated with security patches for Node.js, dependencies (Express, Passport), and Azure AD resources.

## Integration with Nginx

```conf
server {
    listen 443 ssl;  # Assuming HTTPS for security
    server_name your-domain.com;

    # ... SSL configuration ...

    location /auth {
        # Reverse proxy to your Node.js authentication application
        proxy_pass http://127.0.0.1:3000; 
        # ... Header directives like in the previous examples ...
    }

    location / {
        auth_request /auth;  # Intercept requests on the root path 
        auth_request_set $auth_status $upstream_status;

        # Handle successful authentication in Node.js 
        error_page 401 =200 /login; # Assuming '/login' redirects to Azure AD

        # Main proxy settings if auth succeeds
        location = /login {
            proxy_pass http://your-backend-app; 
            proxy_set_header X-Auth-Status $auth_status;
            # ... Other necessary proxy headers ...
        }

        # Additional locations for '/dashboard', etc. with similar config
    }
}
```

## Contributing

Contributions are welcome! Please raise issues for bugs or feature requests.

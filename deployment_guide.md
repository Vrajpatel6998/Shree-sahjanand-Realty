# Production Deployment Guide
## Shree Sahjanand Realty Website on Hostinger KVM2 VPS

This guide provides detailed, step-by-step instructions to deploy your website (React frontend + Express Node.js backend + PostgreSQL database + Nginx reverse proxy) on your Hostinger KVM2 VPS server (`148.230.66.57`) and map it to your domain `shreesahjanandrealty.com`.

---

### Phase 1: Point Your Domain DNS to the VPS
Before starting, log into your domain registrar account (e.g., Hostinger) and navigate to the **DNS Zone Editor** for `shreesahjanandrealty.com`. Add or update the following records:

| Type | Name | Content (IP Address) | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (or leave empty) | `148.230.66.57` | Default |
| **A** | `www` | `148.230.66.57` | Default |

> [!NOTE]
> DNS changes can take anywhere from a few minutes up to 24 hours to propagate globally, though they usually resolve in under an hour.

---

### Phase 2: Connect to your VPS via SSH
Open your terminal (Command Prompt, PowerShell, Git Bash, or Terminal on macOS/Linux) and run the following command:

```bash
ssh root@148.230.66.57
```

Type `yes` when prompted to verify the host authenticity, then enter your VPS root password.

---

### Phase 3: Install Required Server Software
Once logged in, run the following commands sequentially to update the packages and install all dependencies:

#### 1. Update the System
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Node.js (v20 LTS) & npm
```bash
# Download and import the NodeSource GPG key and repository
sudo apt-get install -y ca-certificates curl gnupg
sudo mkdir -p /etc/apt/keyrings
    | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# Create debian repository
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# Install Node.js and build essentials
sudo apt-get update
sudo apt-get install nodejs -y
sudo apt-get install -y build-essential
```

Verify the installation:
```bash
node -v  # Should output v20.x.x
npm -v   # Should output v10.x.x
```

#### 3. Install Git, PostgreSQL, Nginx, and Certbot
```bash
sudo apt install git postgresql postgresql-contrib nginx certbot python3-certbot-nginx -y
```

Verify services are running:
```bash
sudo systemctl status postgresql --no-pager
sudo systemctl status nginx --no-pager
```

#### 4. Install PM2 (Process Manager) globally
```bash
sudo npm install -g pm2
```

---

### Phase 4: Configure the PostgreSQL Database
Log in as the default Postgres superuser and set up a database and dedicated user for the application:

#### 1. Open PostgreSQL Command Line
```bash
sudo -i -u postgres psql
```

#### 2. Create Database and User
Execute the following SQL queries (make sure to end each with `;` and replace `'your_secure_password_here'` with a strong password of your choice):
```sql
-- Create the database
CREATE DATABASE shree_sahjanand_realty;

-- Create the database user
CREATE USER sahjanand_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges to the user on the database
GRANT ALL PRIVILEGES ON DATABASE shree_sahjanand_realty TO sahjanand_user;

-- Switch to the new database to configure schema schema permissions
\c shree_sahjanand_realty;

-- Grant public schema permissions (needed for Prisma migrations)
GRANT ALL ON SCHEMA public TO sahjanand_user;
ALTER DATABASE shree_sahjanand_realty OWNER TO sahjanand_user;

-- Exit PostgreSQL CLI
\q
```

---

### Phase 5: Clone and Setup the Code base
We will place your application in `/var/www/shreesahjanandrealty`.

#### 1. Create directory and adjust permissions
```bash
sudo mkdir -p /var/www/shreesahjanandrealty
sudo chown -R root:root /var/www/shreesahjanandrealty
```

#### 2. Deploy your code to the directory
You can clone the repository directly from your Git hosting service (e.g. GitHub/GitLab) or upload it using SFTP (Hostinger panel provides an easy-to-use file manager, or you can use FileZilla/WinSCP to connect using the same SSH credentials).

```bash
# Example if using Git:
# git clone <your-repo-url> /var/www/shreesahjanandrealty
```

Navigate to the project root directory:
```bash
cd /var/www/shreesahjanandrealty
```

#### 3. Create the Production Environment Configuration
Copy the template `.env.example` inside the `server` folder to `.env`:
```bash
cp server/.env.example server/.env
```

Open and edit the `.env` file using a terminal text editor like `nano`:
```bash
nano server/.env
```

Modify the database connection string and secure tokens:
- Update `DATABASE_URL` with your database credentials:
  ```env
  DATABASE_URL="postgresql://sahjanand_user:your_secure_password_here@localhost:5432/shree_sahjanand_realty?schema=public"
  ```
- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to long, secure random strings (you can generate random base64 strings by running `openssl rand -base64 32` in a separate terminal).
- Verify `ALLOWED_ORIGINS` includes your production domains:
  ```env
  ALLOWED_ORIGINS="https://shreesahjanandrealty.com,https://www.shreesahjanandrealty.com"
  ```
Press `Ctrl + O` to save, `Enter` to confirm, and `Ctrl + X` to exit `nano`.

---

### Phase 6: Build, Initialize, and Seed the Application
Run the root production setup commands to bundle the frontend and generate the database schema:

#### 1. Install dependencies, download assets, and compile React build
```bash
npm run setup:prod
```
This runs the full build sequence:
* Installs workspace dependencies.
* Downloads default mock images for the frontend.
* Compiles the React frontend into static HTML/JS assets inside `/var/www/shreesahjanandrealty/dist`.
* Sets up Node.js backend dependencies and builds the Prisma database client.

#### 2. Initialize and Seed the Database
Ensure your database server is running, then run the initialization command:
```bash
npm run db:setup:prod
```
This executes two steps:
1. `npx prisma db push`: Dynamically maps your database models to the PostgreSQL database tables.
2. `npx prisma db seed`: Inserts default site parameters, permissions, roles, administrative accounts, and default services.

> [!TIP]
> The database seed creates two default administrative logins:
> * **Super Admin**: username: `admin` / password: `admin123`
> * **Receptionist**: username: `reception` / password: `receptionist123`
> 
> Log into the admin dashboard at `https://shreesahjanandrealty.com/admin/login` and immediately change these passwords under **Profile Settings** for security.

---

### Phase 7: Configure PM2 for Backend Daemonization
PM2 manages your Node.js backend processes in the background, autorestarting on failures and starting automatically when the VPS reboots.

#### 1. Start the API using PM2 configuration
```bash
pm2 start ecosystem.config.cjs --env production
```

#### 2. Configure Startup Script
Ensure PM2 runs automatically when the VPS reboots:
```bash
pm2 startup
```
This command will print a specific configuration command to run on your terminal. Copy that line (which starts with `sudo env PATH=...`), paste it, and press `Enter`.

#### 3. Save current PM2 state
```bash
pm2 save
```

You can monitor your backend API status anytime by running:
```bash
pm2 list
pm2 logs shree-realty-api
```

---

### Phase 8: Configure Nginx as a Reverse Proxy
We will configure Nginx to:
1. Directly serve the React frontend static build (`/var/www/shreesahjanandrealty/dist`).
2. Proxy requests starting with `/api` and `/uploads` to the Express backend running on local port `5000`.

#### 1. Create a server block configuration
```bash
sudo nano /etc/nginx/sites-available/shreesahjanandrealty
```

#### 2. Paste the configuration
Copy and paste the following block into the editor (replace `shreesahjanandrealty.com` and `/var/www/shreesahjanandrealty/dist` if needed):
```nginx
server {
    listen 80;
    server_name shreesahjanandrealty.com www.shreesahjanandrealty.com;

    # Frontend React Static Build
    root /var/www/shreesahjanandrealty/dist;
    index index.html;

    # Handle React routing (SPA routes fallback to index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy uploads statically served by Express
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Max upload size for service images / spreadsheets
    client_max_body_size 20M;
}
```
Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit.

#### 3. Enable the Nginx configuration
```bash
# Link configuration from available to enabled
sudo ln -s /etc/nginx/sites-available/shreesahjanandrealty /etc/nginx/sites-enabled/

# Remove Nginx's default splash page
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax for errors
sudo nginx -t
```
If the test reports `syntax is ok` and `test is successful`, reload Nginx to apply changes:
```bash
sudo systemctl reload nginx
```

---

### Phase 9: Secure the Domain with SSL (HTTPS)
Let's Encrypt provides free, automatic SSL certificates. Since we installed Certbot with the Nginx plugin, configuring SSL is a single command:

```bash
sudo certbot --nginx -d shreesahjanandrealty.com -d www.shreesahjanandrealty.com
```

* **Email Address**: Enter your active email address when prompted.
* **Terms of Service**: Accept terms.
* **Redirects**: Certbot will automatically rewrite the Nginx configuration to force redirect all HTTP traffic to HTTPS.

After completion, verify that Certbot set up a cron job for automatic renewal:
```bash
sudo systemctl status certbot.timer --no-pager
```

---

### Phase 10: Final Verification
Open your browser and navigate to:
* **Frontend Site**: `https://shreesahjanandrealty.com`
* **API Health Check**: `https://shreesahjanandrealty.com/api/health`
* **Admin Dashboard**: `https://shreesahjanandrealty.com/admin/login`

Your website is now successfully deployed and secured on your Hostinger KVM2 VPS!

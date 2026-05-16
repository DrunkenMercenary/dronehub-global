
import os
import subprocess
import sys
import shutil

# Configuration
WORKSPACE_ROOT = os.getcwd()
DIRECTIVES_DIR = os.path.join(WORKSPACE_ROOT, "directives")
EXECUTION_DIR = os.path.join(WORKSPACE_ROOT, "execution")
APPS_DIR = os.path.join(WORKSPACE_ROOT, "apps")
WEB_APP_DIR = os.path.join(APPS_DIR, "web")
PACKAGES_DIR = os.path.join(WORKSPACE_ROOT, "packages")
DB_PACKAGE_DIR = os.path.join(PACKAGES_DIR, "db")
TMP_DIR = os.path.join(WORKSPACE_ROOT, ".tmp")

def run_command(command, cwd=WORKSPACE_ROOT, check=True):
    print(f"Running: {command} in {cwd}")
    try:
        result = subprocess.run(
            command, 
            cwd=cwd, 
            shell=True, 
            check=check, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}", file=sys.stderr)
        print(e.output, file=sys.stderr)
        print(e.stderr, file=sys.stderr)
        if check:
            raise

def ensure_dirs():
    dirs = [DIRECTIVES_DIR, EXECUTION_DIR, APPS_DIR, PACKAGES_DIR, TMP_DIR]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
    print("Directories structure ensured.")

def check_node_version():
    try:
        run_command("node --version")
        run_command("npm --version")
    except Exception:
        print("Node.js or npm is not installed/accessible. Please install Node.js.", file=sys.stderr)
        sys.exit(1)

def scaffold_web_app():
    if os.path.exists(WEB_APP_DIR):
        print(f"Web app dir {WEB_APP_DIR} already exists. Skipping init.")
        return

    print("Scaffolding Next.js web app...")
    # Initialize Next.js app with desired flags
    # We use npx create-next-app and move it because it creates a subfolder
    cmd = "npx -y create-next-app@latest web --typescript --tailwind --eslint --no-src-dir --app --import-alias \"@/*\" --use-npm"
    run_command(cmd, cwd=APPS_DIR)
    
    # Install shadcn/ui cli
    # We'll run the init later or manual setup, for now ensuring dependencies
    # run_command("npx -y shadcn-ui@latest init", cwd=WEB_APP_DIR) 
    
    # Dependencies for MVP
    deps = [
        "next-auth", 
        "lucide-react", 
        "zod", 
        "react-hook-form", 
        "@hookform/resolvers", 
        "clsx", 
        "tailwind-merge"
    ]
    run_command(f"npm install {' '.join(deps)}", cwd=WEB_APP_DIR)

def scaffold_db_package():
    if os.path.exists(DB_PACKAGE_DIR):
        print(f"DB package dir {DB_PACKAGE_DIR} already exists.")
    else:
        os.makedirs(DB_PACKAGE_DIR)
        print("Scaffolding DB package...")
        run_command("npm init -y", cwd=DB_PACKAGE_DIR)
        
    # Install Prisma
    run_command("npm install prisma --save-dev", cwd=DB_PACKAGE_DIR)
    run_command("npm install @prisma/client", cwd=DB_PACKAGE_DIR)
    
    # Initialize Prisma if schema doesn't exist
    if not os.path.exists(os.path.join(DB_PACKAGE_DIR, "prisma", "schema.prisma")):
        run_command("npx prisma init --datasource-provider postgresql", cwd=DB_PACKAGE_DIR)

def create_base_configs():
    # .env.example
    env_content = """
DATABASE_URL="postgresql://user:password@localhost:5432/dronehub?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="supersecretchangeinprod"
JWT_SECRET="supersecretchangeinprod"

# S3 Compatible (e.g. R2, MinIO, AWS)
S3_ENDPOINT=""
S3_BUCKET=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
"""
    with open(os.path.join(WORKSPACE_ROOT, ".env.example"), "w") as f:
        f.write(env_content)
    
    # Create .env if not exists
    if not os.path.exists(os.path.join(WORKSPACE_ROOT, ".env")):
        shutil.copy(os.path.join(WORKSPACE_ROOT, ".env.example"), os.path.join(WORKSPACE_ROOT, ".env"))

    # Workspace README
    readme_content = """# DroneHub MVP

This monorepo contains the DroneHub Marketplace MVP.

## Structure
- `apps/web`: Next.js frontend and API
- `packages/db`: Prisma ORM and database schema
- `execution`: Helper scripts
- `directives`: Instructions and requirements

## directives/dronehub_mvp_build.md

## Setup
1. `pip install -r requirements.txt` (if using python scripts) or just node
2. `npm install` in apps/web
3. Setup `.env`
4. `cd packages/db && npx prisma db push`
5. `cd apps/web && npm run dev`
"""
    with open(os.path.join(WORKSPACE_ROOT, "README.md"), "w") as f:
        f.write(readme_content)

def main():
    print("Starting DroneHub MVP Scaffold...")
    check_node_version()
    ensure_dirs()
    scaffold_web_app()
    scaffold_db_package()
    create_base_configs()
    print("Scaffolding complete.")

if __name__ == "__main__":
    main()

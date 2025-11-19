import argparse
import asyncio
import sys
from pathlib import Path

import asyncpg
import uvicorn

from backend.config import get_settings
from backend.core.security import get_password_hash


class MigrationManager:
    """
    SQL migration manager with rollback support
    """
    
    MIGRATIONS_TABLE = "schema_migrations"
    
    def __init__(self):
        self.settings = get_settings()
        self.migrations_dir = Path(__file__).parent / "migrations"
        self.conn: asyncpg.Connection | None = None
    
    async def connect(self) -> None:
        """
        Connect to database
        """
        self.conn = await asyncpg.connect(
            host=self.settings.database.host,
            port=self.settings.database.port,
            user=self.settings.database.username,
            password=self.settings.database.password,
            database=self.settings.database.database,
        )
    
    async def disconnect(self) -> None:
        """
        Disconnect from database
        """
        if self.conn:
            await self.conn.close()
            self.conn = None
    
    async def ensure_migrations_table(self) -> None:
        """
        Create migrations tracking table if not exists
        """
        await self.conn.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.MIGRATIONS_TABLE} (
                id SERIAL PRIMARY KEY,
                version VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description TEXT
            )
        """)
    
    async def get_applied_migrations(self) -> list[str]:
        """
        Get list of applied migrations
        
        Returns:
            List of migration versions
        """
        rows = await self.conn.fetch(
            f"SELECT version FROM {self.MIGRATIONS_TABLE} ORDER BY version"
        )
        return [row["version"] for row in rows]
    
    def get_available_migrations(self) -> list[tuple[str, Path, Path]]:
        """
        Get list of available migrations
        
        Returns:
            List of (version, up_file, down_file) tuples
        """
        migrations = []
        
        for up_file in sorted(self.migrations_dir.glob("*.up.sql")):
            version = up_file.stem.replace(".up", "")
            down_file = self.migrations_dir / f"{version}.down.sql"
            
            if down_file.exists():
                migrations.append((version, up_file, down_file))
        
        return migrations
    
    async def apply_migration(self, version: str, up_file: Path) -> None:
        """
        Apply migration
        
        Args:
            version: Migration version
            up_file: Path to up.sql file
        """
        print(f"[*] Applying migration: {version}")
        
        sql = up_file.read_text(encoding="utf-8")
        
        async with self.conn.transaction():
            await self.conn.execute(sql)
            await self.conn.execute(
                f"INSERT INTO {self.MIGRATIONS_TABLE} (version) VALUES ($1)",
                version
            )
        
        print(f"[OK] Migration {version} applied successfully")
    
    async def rollback_migration(self, version: str, down_file: Path) -> None:
        """
        Rollback migration
        
        Args:
            version: Migration version
            down_file: Path to down.sql file
        """
        print(f"[*] Rolling back migration: {version}")
        
        sql = down_file.read_text(encoding="utf-8")
        
        async with self.conn.transaction():
            await self.conn.execute(sql)
            await self.conn.execute(
                f"DELETE FROM {self.MIGRATIONS_TABLE} WHERE version = $1",
                version
            )
        
        print(f"[OK] Migration {version} rolled back successfully")
    
    async def migrate_up(self, target: str | None = None) -> None:
        """
        Apply pending migrations
        
        Args:
            target: Target migration version (None = apply all)
        """
        await self.ensure_migrations_table()
        
        applied = await self.get_applied_migrations()
        available = self.get_available_migrations()
        
        pending = [
            (version, up_file, down_file)
            for version, up_file, down_file in available
            if version not in applied
        ]
        
        if not pending:
            print("[OK] No pending migrations")
            return
        
        if target:
            pending = [
                (version, up_file, down_file)
                for version, up_file, down_file in pending
                if version <= target
            ]
        
        for version, up_file, _ in pending:
            await self.apply_migration(version, up_file)
        
        print(f"\n[OK] Applied {len(pending)} migration(s)")
    
    async def migrate_down(self, steps: int = 1) -> None:
        """
        Rollback migrations
        
        Args:
            steps: Number of migrations to rollback
        """
        await self.ensure_migrations_table()
        
        applied = await self.get_applied_migrations()
        available = {version: (up_file, down_file) for version, up_file, down_file in self.get_available_migrations()}
        
        if not applied:
            print("[INFO] No migrations to rollback")
            return
        
        to_rollback = applied[-steps:]
        
        for version in reversed(to_rollback):
            if version not in available:
                print(f"[WARN] Migration {version} not found in files")
                continue
            
            _, down_file = available[version]
            await self.rollback_migration(version, down_file)
        
        print(f"\n[OK] Rolled back {len(to_rollback)} migration(s)")
    
    async def migrate_reset(self, force: bool = False) -> None:
        """
        Rollback all migrations
        
        Args:
            force: Skip confirmation
        """
        await self.ensure_migrations_table()
        
        applied = await self.get_applied_migrations()
        
        if not applied:
            print("[INFO] No migrations to rollback")
            return
        
        if not force:
            confirm = input("[WARN] This will rollback ALL migrations. Continue? (yes/no): ")
            if confirm.lower() != "yes":
                print("[ABORT] Operation cancelled")
                return
        
        await self.migrate_down(len(applied))
    
    async def migrate_status(self) -> None:
        """
        Show migration status
        """
        await self.ensure_migrations_table()
        
        applied = await self.get_applied_migrations()
        available = self.get_available_migrations()
        
        print("\n" + "="*70)
        print("Migration Status")
        print("="*70 + "\n")
        
        if not available:
            print("[INFO] No migrations found")
            return
        
        for version, *_ in available:
            status = "[APPLIED]" if version in applied else "[PENDING]"
            print(f"{status:12} | {version}")
        
        print(f"\n{'='*70}")
        print(f"Total: {len(available)} migrations")
        print(f"Applied: {len(applied)} migrations")
        print(f"Pending: {len(available) - len(applied)} migrations")
        print("="*70 + "\n")
    
    async def create_migration(self, name: str) -> None:
        """
        Create new migration files
        
        Args:
            name: Migration name
        """
        import datetime
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        version = f"{timestamp}_{name}"
        
        up_file = self.migrations_dir / f"{version}.up.sql"
        down_file = self.migrations_dir / f"{version}.down.sql"
        
        up_file.write_text("-- Migration: {}\n-- Created: {}\n\n".format(
            name, 
            datetime.datetime.now().isoformat()
        ))
        
        down_file.write_text("-- Rollback: {}\n-- Created: {}\n\n".format(
            name,
            datetime.datetime.now().isoformat()
        ))
        
        print(f"[OK] Created migration files:")
        print(f"    {up_file.name}")
        print(f"    {down_file.name}")


class UserManager:
    """
    User management
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.conn: asyncpg.Connection | None = None
    
    async def connect(self) -> None:
        """
        Connect to database
        """
        self.conn = await asyncpg.connect(
            host=self.settings.database.host,
            port=self.settings.database.port,
            user=self.settings.database.username,
            password=self.settings.database.password,
            database=self.settings.database.database,
        )
    
    async def disconnect(self) -> None:
        """
        Disconnect from database
        """
        if self.conn:
            await self.conn.close()
            self.conn = None
    
    async def create_user(
        self,
        email: str,
        password: str,
        full_name: str | None = None,
        is_admin: bool = False,
    ) -> None:
        """
        Create user
        
        Args:
            email: User email
            password: User password
            full_name: User full name
            is_admin: Is admin user
        """
        check_query = "SELECT id FROM users WHERE email = $1"
        existing = await self.conn.fetchrow(check_query, email)
        
        if existing:
            print(f"[ERROR] User with email {email} already exists")
            return
        
        password_hash = get_password_hash(password)
        
        insert_query = """
            INSERT INTO users (email, password_hash, full_name, is_admin, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
            RETURNING id, email, full_name, is_admin
        """
        
        user = await self.conn.fetchrow(insert_query, email, password_hash, full_name, is_admin)
        
        print(f"\n[OK] User created successfully:")
        print(f"    ID: {user['id']}")
        print(f"    Email: {user['email']}")
        print(f"    Name: {user['full_name'] or 'N/A'}")
        print(f"    Role: {'Admin' if user['is_admin'] else 'User'}")


def create_parser() -> argparse.ArgumentParser:
    """
    Create CLI argument parser
    
    Returns:
        Configured argument parser
    """
    parser = argparse.ArgumentParser(
        prog="stack-radar-cli",
        description="Stack Radar - FastAPI Backend CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    serve_parser = subparsers.add_parser("serve", help="Start FastAPI server")
    serve_parser.add_argument("--host", default="0.0.0.0", help="Host to bind (default: 0.0.0.0)")
    serve_parser.add_argument("--port", type=int, default=8000, help="Port to bind (default: 8000)")
    serve_parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    serve_parser.add_argument("--workers", type=int, default=1, help="Number of workers (default: 1)")
    
    migrate_parser = subparsers.add_parser("migrate", help="Database migrations")
    migrate_subparsers = migrate_parser.add_subparsers(dest="migrate_command", help="Migration commands")
    
    migrate_subparsers.add_parser("status", help="Show migration status")
    
    migrate_up = migrate_subparsers.add_parser("up", help="Apply pending migrations")
    migrate_up.add_argument("--target", help="Target migration version")
    
    migrate_down = migrate_subparsers.add_parser("down", help="Rollback migrations")
    migrate_down.add_argument("--steps", type=int, default=1, help="Number of steps to rollback (default: 1)")
    
    migrate_reset = migrate_subparsers.add_parser("reset", help="Rollback all migrations")
    migrate_reset.add_argument("--force", action="store_true", help="Skip confirmation")
    
    migrate_create = migrate_subparsers.add_parser("create", help="Create new migration")
    migrate_create.add_argument("name", help="Migration name")
    
    user_parser = subparsers.add_parser("user", help="User management")
    user_subparsers = user_parser.add_subparsers(dest="user_command", help="User commands")
    
    user_create = user_subparsers.add_parser("create", help="Create new user")
    user_create.add_argument("--email", required=True, help="User email")
    user_create.add_argument("--password", required=True, help="User password")
    user_create.add_argument("--name", help="User full name")
    user_create.add_argument("--admin", action="store_true", help="Create admin user")
    
    return parser


async def handle_migrate(args: argparse.Namespace) -> None:
    """
    Handle migrate commands
    
    Args:
        args: Parsed arguments
    """
    manager = MigrationManager()
    
    try:
        await manager.connect()
        
        if args.migrate_command == "status":
            await manager.migrate_status()
        
        elif args.migrate_command == "up":
            await manager.migrate_up(args.target if hasattr(args, "target") else None)
        
        elif args.migrate_command == "down":
            await manager.migrate_down(args.steps)
        
        elif args.migrate_command == "reset":
            await manager.migrate_reset(args.force)
        
        elif args.migrate_command == "create":
            await manager.create_migration(args.name)
        
        else:
            print("[ERROR] Unknown migrate command")
            sys.exit(1)
    
    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)
    
    finally:
        await manager.disconnect()


async def handle_user(args: argparse.Namespace) -> None:
    """
    Handle user commands
    
    Args:
        args: Parsed arguments
    """
    manager = UserManager()
    
    try:
        await manager.connect()
        
        if args.user_command == "create":
            await manager.create_user(
                email=args.email,
                password=args.password,
                full_name=args.name,
                is_admin=args.admin,
            )
        
        else:
            print("[ERROR] Unknown user command")
            sys.exit(1)
    
    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)
    
    finally:
        await manager.disconnect()


def handle_serve(args: argparse.Namespace) -> None:
    """
    Handle serve command
    
    Args:
        args: Parsed arguments
    """
    print(f"[*] Starting Stack Radar FastAPI server...")
    print(f"    Host: {args.host}")
    print(f"    Port: {args.port}")
    print(f"    Reload: {'Enabled' if args.reload else 'Disabled'}")
    print(f"    Workers: {args.workers}")
    print()
    
    uvicorn.run(
        "backend.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers if not args.reload else 1,
        log_level="info",
    )


def main() -> None:
    """
    Main CLI entry point
    """
    parser = create_parser()
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    if args.command == "serve":
        handle_serve(args)
    
    elif args.command == "migrate":
        if not args.migrate_command:
            print("[ERROR] Migrate command required (status, up, down, reset, create)")
            sys.exit(1)
        asyncio.run(handle_migrate(args))
    
    elif args.command == "user":
        if not args.user_command:
            print("[ERROR] User command required (create)")
            sys.exit(1)
        asyncio.run(handle_user(args))
    
    else:
        print(f"[ERROR] Unknown command: {args.command}")
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()


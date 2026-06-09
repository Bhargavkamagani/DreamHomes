# Gharbano PostgreSQL Schema

This folder contains the PostgreSQL schema for the MVP database.

## Create Database And Tables

Install PostgreSQL, make sure `psql` is available in PATH, then run:

```powershell
cd "M:\Ghar\versions\v2\backend\database"
.\run_schema.ps1 -UserName postgres
```

The script creates:

- `gharbano` database
- all MVP tables
- foreign keys
- indexes for auth, pincode matching, project discovery, messages, and notifications
- status/rating constraints where useful

## pgAdmin 4

If you prefer pgAdmin:

1. Open pgAdmin 4.
2. Connect to a PostgreSQL server.
3. Right-click `Databases` and create a database named `gharbano`.
4. Open Query Tool on the `gharbano` database.
5. Open and run:

```txt
M:\Ghar\versions\v2\backend\database\tables.sql
```

Use `tables.sql` inside pgAdmin. `schema.sql` is intended for `psql` because it contains database creation and connection commands.

## Backend Connection

Set backend `.env`:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/gharbano
```

Then start FastAPI:

```powershell
cd "M:\Ghar\versions\v2\backend"
uvicorn app.main:app --reload
```

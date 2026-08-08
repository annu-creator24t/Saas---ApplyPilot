import asyncio
import os
from pathlib import Path
from app.db.connection import connect_to_mongodb, get_database, close_mongodb_connection

async def inspect():
    await connect_to_mongodb()
    db = get_database()
    
    resumes = await db["resumes"].find({}).to_list(length=100)
    print(f"\n================ TOTAL RESUMES IN DB: {len(resumes)} ================")
    
    base_backend_dir = Path(__file__).resolve().parent.parent
    base_workspace_dir = base_backend_dir.parent
    
    for r in resumes:
        r_id = str(r["_id"])
        user_id = str(r.get("user_id"))
        title = r.get("title")
        original_filename = r.get("original_filename")
        stored_filename = r.get("stored_filename")
        file_url = r.get("file_url")
        
        print(f"\nRESUME ID: {r_id}")
        print(f"  Title: {title}")
        print(f"  User ID: {user_id}")
        print(f"  Original Filename: {original_filename}")
        print(f"  Stored Filename: {stored_filename}")
        print(f"  File URL: {file_url}")
        
        # Check candidate locations on disk
        candidates = []
        if stored_filename:
            candidates.append(base_backend_dir / "uploads" / "resumes" / stored_filename)
            candidates.append(base_workspace_dir / "uploads" / "resumes" / stored_filename)
            candidates.append(Path("uploads/resumes") / stored_filename)
            candidates.append(Path("backend/uploads/resumes") / stored_filename)
        
        found = False
        for c in candidates:
            if c.exists() and c.is_file():
                print(f"  FOUND ON DISK: {c.resolve()}")
                found = True
                break
        
        if not found:
            print("  FILE NOT FOUND ON DISK IN ANY CANDIDATE LOCATIONS!")

    await close_mongodb_connection()

if __name__ == "__main__":
    asyncio.run(inspect())

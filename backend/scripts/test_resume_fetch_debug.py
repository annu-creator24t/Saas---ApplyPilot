import asyncio
from app.db.connection import connect_to_mongodb, close_mongodb_connection, get_database

async def debug_db():
    await connect_to_mongodb()
    db = get_database()
    
    users = await db["users"].find().to_list(100)
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f"User ID: {u['_id']} (type: {type(u['_id'])}), email: {u.get('email')}")

    resumes = await db["resumes"].find().to_list(100)
    print(f"\nTotal Resumes: {len(resumes)}")
    for r in resumes:
        uid = r.get("user_id")
        print(f"Resume ID: {r['_id']}, title: {r.get('title')}, user_id in resume: {uid} (type: {type(uid)})")

    await close_mongodb_connection()

if __name__ == "__main__":
    asyncio.run(debug_db())

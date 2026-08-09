import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.connection import connect_to_mongodb, get_database


async def main():
    print("=" * 60)
    print("ApplyPilot Admin Role Grant Tool")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python scripts/make_admin.py <user_email_or_id>")
        return

    target = sys.argv[1]

    await connect_to_mongodb()
    db = get_database()

    user = await db["users"].find_one({"email": target})
    if not user:
        from bson import ObjectId
        try:
            user = await db["users"].find_one({"_id": ObjectId(target)})
        except Exception:
            pass

    if not user:
        print(f"Error: User '{target}' not found.")
        return

    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"is_admin": True, "role": "admin"}}
    )

    print(f"SUCCESS: Promoted user '{user.get('email')}' (ID: {user['_id']}) to Admin!")


if __name__ == "__main__":
    asyncio.run(main())

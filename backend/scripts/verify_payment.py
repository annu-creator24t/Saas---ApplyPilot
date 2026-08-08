import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add parent dir to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.connection import connect_to_mongodb, get_database


async def main():
    print("=" * 60)
    print("ApplyPilot Subscription & Payment Activation Tool")
    print("=" * 60)

    await connect_to_mongodb()
    db = get_database()

    if len(sys.argv) < 2:
        print("\nPending Payments:")
        cursor = db["payments"].find({"status": "pending"})
        payments = await cursor.to_list(length=50)
        if not payments:
            print("  No pending payments found.")
        else:
            for p in payments:
                print(f"  User ID: {p.get('user_id')} | Email: {p.get('user_email')} | Ref: {p.get('upi_reference')} | Date: {p.get('submitted_at')}")

        print("\nUsage:")
        print("  python scripts/verify_payment.py <user_email_or_id> [duration_days]")
        return

    target = sys.argv[1]
    days = int(sys.argv[2]) if len(sys.argv) > 2 else 30

    # Find user by email or _id
    from bson import ObjectId
    user = await db["users"].find_one({"email": target})
    if not user:
        try:
            user = await db["users"].find_one({"_id": ObjectId(target)})
        except Exception:
            pass

    if not user:
        print(f"Error: User '{target}' not found.")
        return

    now = datetime.utcnow()
    end_date = now + timedelta(days=days)

    await db["users"].update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "subscription_status": "active",
                "subscription_plan": "pro",
                "payment_status": "approved",
                "subscription_start": now,
                "subscription_end": end_date,
                "updated_at": now,
            }
        },
    )

    await db["payments"].update_many(
        {"user_id": str(user["_id"]), "status": "pending"},
        {
            "$set": {
                "status": "approved",
                "verified_at": now,
            }
        },
    )

    print(f"SUCCESS: Activated PRO subscription for user '{user.get('email')}' until {end_date.strftime('%Y-%m-%d %H:%M:%S UTC')}.")

if __name__ == "__main__":
    asyncio.run(main())

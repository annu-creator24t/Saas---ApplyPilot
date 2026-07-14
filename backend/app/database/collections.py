from app.database.mongodb import database

users_collection = database["users"]

resume_collection = database["resume_analysis"]

cover_letter_collection = database["cover_letters"]

interview_collection = database["interviews"]
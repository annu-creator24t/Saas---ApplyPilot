from app.database.mongodb import database

users_collection = database["users"]

resume_analysis_collection = database["resume_analysis"]

cover_letters_collection = database["cover_letters"]

interviews_collection = database["interviews"]
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import os

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

result = cloudinary.uploader.upload(
    "README.md",   # any small file in your backend folder
    resource_type="raw",
    folder="applypilot/test"
)

print(result["secure_url"])
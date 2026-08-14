from typing import Any, Optional

from bson import ObjectId

from app.db.base import get_collection


class ResumeRepository:

    @property
    def collection(self):
        return get_collection("resumes")

    # =====================================================
    # Helpers
    # =====================================================

    @staticmethod
    def _serialize_resume(
        resume: Optional[dict],
    ) -> Optional[dict]:

        if not resume:
            return None

        resume["resume_id"] = str(
            resume["_id"]
        )

        del resume["_id"]

        # Backward compatibility:
        # Existing resumes may not have this field.
        resume.setdefault(
            "is_default",
            False,
        )

        return resume

    # =====================================================
    # Create Resume
    # =====================================================

    async def create_resume(
        self,
        data: dict[str, Any],
    ) -> str:

        result = await self.collection.insert_one(
            data
        )

        return str(
            result.inserted_id
        )

    # =====================================================
    # Get Single Resume
    # =====================================================

    async def get_resume(
        self,
        resume_id: str,
    ) -> Optional[dict]:

        try:
            object_id = ObjectId(
                resume_id
            )
        except Exception:
            return None

        resume = await self.collection.find_one(
            {
                "_id": object_id
            }
        )

        return self._serialize_resume(
            resume
        )

    # =====================================================
    # Get User Resumes
    # =====================================================

    async def get_user_resumes(
        self,
        user_id: str,
    ) -> list[dict]:

        str_id = str(
            user_id
        )

        query: dict[str, Any] = {
            "user_id": str_id
        }

        # Support both string and ObjectId user IDs
        # for backward compatibility.
        if ObjectId.is_valid(
            str_id
        ):
            query = {
                "$or": [
                    {
                        "user_id": str_id
                    },
                    {
                        "user_id": ObjectId(
                            str_id
                        )
                    },
                ]
            }

        cursor = (
            self.collection
            .find(query)
            .sort(
                "created_at",
                -1,
            )
        )

        resumes = await cursor.to_list(
            length=None
        )

        return [
            self._serialize_resume(
                resume
            )
            for resume in resumes
        ]

    # =====================================================
    # Get Default Resume
    # =====================================================

    async def get_default_resume(
        self,
        user_id: str,
    ) -> Optional[dict]:

        str_id = str(
            user_id
        )

        user_query: dict[str, Any] = {
            "user_id": str_id
        }

        # Support both string and ObjectId user IDs.
        if ObjectId.is_valid(
            str_id
        ):
            user_query = {
                "$or": [
                    {
                        "user_id": str_id
                    },
                    {
                        "user_id": ObjectId(
                            str_id
                        )
                    },
                ]
            }

        query = {
            "$and": [
                user_query,
                {
                    "is_default": True
                },
            ]
        }

        resume = await self.collection.find_one(
            query,
            sort=[
                (
                    "created_at",
                    -1,
                )
            ],
        )

        return self._serialize_resume(
            resume
        )

    # =====================================================
    # Get Latest Resume
    # =====================================================

    async def get_latest_resume(
        self,
        user_id: str,
    ) -> Optional[dict]:

        resumes = (
            await self.get_user_resumes(
                user_id
            )
        )

        if not resumes:
            return None

        return resumes[0]

    # =====================================================
    # Set Default Resume
    # =====================================================

    async def set_default_resume(
        self,
        user_id: str,
        resume_id: str,
    ) -> bool:

        try:
            object_id = ObjectId(
                resume_id
            )
        except Exception:
            return False

        str_id = str(
            user_id
        )

        user_query: dict[str, Any] = {
            "user_id": str_id
        }

        # Support both string and ObjectId user IDs.
        if ObjectId.is_valid(
            str_id
        ):
            user_query = {
                "$or": [
                    {
                        "user_id": str_id
                    },
                    {
                        "user_id": ObjectId(
                            str_id
                        )
                    },
                ]
            }

        # =================================================
        # Verify that the resume belongs to this user
        # =================================================

        owned_resume = await self.collection.find_one(
            {
                "$and": [
                    user_query,
                    {
                        "_id": object_id
                    },
                ]
            }
        )

        if not owned_resume:
            return False

        # =================================================
        # Remove default status from all user resumes
        # =================================================

        await self.collection.update_many(
            user_query,
            {
                "$set": {
                    "is_default": False
                }
            },
        )

        # =================================================
        # Make selected resume default
        # =================================================

        result = await self.collection.update_one(
            {
                "_id": object_id
            },
            {
                "$set": {
                    "is_default": True
                }
            },
        )

        return (
            result.modified_count > 0
            or owned_resume.get(
                "is_default",
                False,
            )
        )

    # =====================================================
    # Rename Resume
    # =====================================================

    async def rename_resume(
        self,
        resume_id: str,
        title: str,
    ) -> bool:

        try:
            object_id = ObjectId(
                resume_id
            )
        except Exception:
            return False

        result = await self.collection.update_one(
            {
                "_id": object_id
            },
            {
                "$set": {
                    "title": title,
                }
            },
        )

        return (
            result.modified_count > 0
        )

    # =====================================================
    # Update ATS Analysis
    # =====================================================

    async def update_analysis(
        self,
        resume_id: str,
        analysis: dict[str, Any],
    ) -> None:

        try:
            object_id = ObjectId(
                resume_id
            )
        except Exception:
            return

        await self.collection.update_one(
            {
                "_id": object_id
            },
            {
                "$set": {
                    "analysis": analysis,
                    "ats_score": analysis.get(
                        "ats_score"
                    ),
                }
            },
        )

    # =====================================================
    # Update Extracted Text
    # =====================================================

    async def update_extracted_text(
        self,
        resume_id: str,
        extracted_text: str,
    ) -> bool:

        try:
            object_id = ObjectId(
                resume_id
            )
        except Exception:
            return False

        result = await self.collection.update_one(
            {
                "_id": object_id
            },
            {
                "$set": {
                    "extracted_text":
                        extracted_text,
                }
            },
        )

        return (
            result.modified_count > 0
        )

    # =====================================================
    # Delete Resume
    # =====================================================

    async def delete_resume(
        self,
        resume_id: str,
    ) -> bool:

        try:
            object_id = ObjectId(
                resume_id
            )
        except Exception:
            return False

        # Check whether the resume being deleted
        # is currently the default resume.
        resume = await self.collection.find_one(
            {
                "_id": object_id
            }
        )

        result = await self.collection.delete_one(
            {
                "_id": object_id
            }
        )

        deleted = (
            result.deleted_count > 0
        )

        if (
            deleted
            and resume
            and resume.get(
                "is_default",
                False,
            )
        ):
            # If the default resume was deleted,
            # automatically promote the latest remaining
            # resume to default.
            user_id = resume.get(
                "user_id"
            )

            if user_id:
                remaining = (
                    await self.get_user_resumes(
                        str(user_id)
                    )
                )

                if remaining:
                    replacement_id = (
                        remaining[0].get(
                            "resume_id"
                        )
                    )

                    if replacement_id:
                        await self.set_default_resume(
                            user_id=str(
                                user_id
                            ),
                            resume_id=str(
                                replacement_id
                            ),
                        )

        return deleted
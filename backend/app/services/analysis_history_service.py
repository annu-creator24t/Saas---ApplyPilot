from app.repositories.analysis_history_repository import AnalysisHistoryRepository


class AnalysisHistoryService:

    def __init__(self):
        self.repo = AnalysisHistoryRepository()

    async def get_history(self, user_id: str):

        analyses = await self.repo.get_history(user_id)

        result = []

        for analysis in analyses:

            result.append({

                "analysis_id": str(analysis["_id"]),

                "resume_id": str(
                    analysis["resume_id"]
                ),

                "resume_name": analysis.get(
                    "resume_name",
                    "Unknown Resume"
                ),

                "overall_score": analysis.get(
                    "overall_score",
                    0
                ),

                "created_at": str(
                    analysis["created_at"]
                )
            })

        return {
            "analyses": result
        }
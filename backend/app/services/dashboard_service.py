from app.repositories.application_repository import ApplicationRepository
from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.common import APIResponse


class DashboardService:

    def __init__(self):
        self.repo = DashboardRepository()
        self.app_repo = ApplicationRepository()

    async def get_dashboard(self, user_id: str):

        total_resumes = await self.repo.get_total_resumes(user_id)
        total_analyses = await self.repo.get_total_analyses(user_id)

        latest_resume = await self.repo.get_latest_resume(user_id)
        latest_analysis = await self.repo.get_latest_analysis(user_id)

        scores = await self.repo.get_all_scores(user_id)
        app_stats = await self.app_repo.get_stats(user_id)
        recent_apps = await self.app_repo.get_user_applications(user_id, limit=5)

        if scores:
            values = [
                s.get("overall_score", 0)
                for s in scores
            ]

            average = round(sum(values) / len(values), 2)
            highest = max(values)
        else:
            average = 0
            highest = 0

        dashboard = {
            "total_resumes": total_resumes,
            "total_analyses": total_analyses,
            "average_score": average,
            "highest_score": highest,
            "latest_resume": (
                latest_resume.get("file_name") or latest_resume.get("title")
                if latest_resume
                else None
            ),
            "latest_analysis_score": (
                latest_analysis.get("overall_score")
                if latest_analysis
                else None
            ),
            "applications_stats": app_stats,
            "recent_applications": recent_apps,
        }

        return APIResponse(
            message="Dashboard data fetched successfully.",
            data=dashboard,
        )
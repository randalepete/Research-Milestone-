from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.utils.text import slugify
from .models import Project
import json


def home(request):
    return render(request, "portfolio/home.html")


def projects_api(request):
    if not Project.objects.exists():
        data = [
            {"name": "CastleSuite", "description": "Open-source enterprise suite.", "url": "https://example.com/castle"},
            {"name": "VantagePLC", "description": "PLC training & dashboards.", "url": "https://example.com/vantage"},
        ]
    else:
        data = [
            {"name": p.name, "description": p.description, "url": p.url}
            for p in Project.objects.all().order_by("-created_at")
        ]
    return JsonResponse({"projects": data})


@require_POST
def create_project_api(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")

    name = (payload.get("name") or "").strip()
    url = (payload.get("url") or "").strip()
    description = (payload.get("description") or "").strip()

    if not name:
        return HttpResponseBadRequest("Name is required")

    p = Project.objects.create(name=name, url=url, description=description)
    derived = {"slug": slugify(p.name), "description_length": len(description)}

    return JsonResponse({
        "ok": True,
        "project": {
            "name": p.name, "url": p.url, "description": p.description, **derived
        }
    }, status=201)

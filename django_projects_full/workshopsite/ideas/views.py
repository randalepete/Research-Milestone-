import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render, get_object_or_404
from django.views.decorators.http import require_POST
from django.utils.text import slugify
from .models import Idea

KEYWORDS = {"security": 3, "energy": 3, "robot": 2, "ai": 2, "ux": 1}

def home(request):
    return render(request, "ideas/home.html")

def ideas_api(request):
    items = [
        {"id": i.id, "title": i.title, "details": i.details, "url": i.url, "votes": i.votes}
        for i in Idea.objects.all().order_by("-votes", "-created_at")
    ]
    return JsonResponse({"ideas": items})

@require_POST
def create_idea_api(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")
    title = (payload.get("title") or "").strip()
    details = (payload.get("details") or "").strip()
    url = (payload.get("url") or "").strip()
    if not title:
        return HttpResponseBadRequest("Title is required")
    idea = Idea.objects.create(title=title, details=details, url=url)
    word_count = len(details.split()) if details else 0
    priority = sum(v for k, v in KEYWORDS.items() if k in (title + " " + details).lower())
    data = {
        "id": idea.id, "title": idea.title, "details": idea.details,
        "url": idea.url, "votes": idea.votes,
        "slug": slugify(title), "word_count": word_count, "priority": priority,
    }
    return JsonResponse({"ok": True, "idea": data}, status=201)

@require_POST
def vote_api(request, pk: int):
    idea = get_object_or_404(Idea, pk=pk)
    idea.votes = (idea.votes or 0) + 1
    idea.save(update_fields=["votes"])
    return JsonResponse({"ok": True, "id": idea.id, "votes": idea.votes})

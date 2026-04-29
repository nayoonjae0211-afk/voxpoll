from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException
from livekit import api
from pydantic import BaseModel

from app.config import get_settings


router = APIRouter(prefix="/api/livekit", tags=["livekit"])


class TokenRequest(BaseModel):
    user_name: str = "응답자"


class TokenResponse(BaseModel):
    token: str
    url: str
    room: str
    identity: str


@router.post("/token", response_model=TokenResponse)
async def issue_token(req: TokenRequest) -> TokenResponse:
    s = get_settings()
    if not (s.livekit_url and s.livekit_api_key and s.livekit_api_secret):
        raise HTTPException(
            status_code=503,
            detail="LiveKit 환경변수(LIVEKIT_URL/API_KEY/API_SECRET)가 설정되지 않았습니다.",
        )

    room = f"voxpoll-{uuid.uuid4().hex[:10]}"
    identity = f"user-{uuid.uuid4().hex[:8]}"
    token = (
        api.AccessToken(s.livekit_api_key, s.livekit_api_secret)
        .with_identity(identity)
        .with_name(req.user_name)
        .with_grants(
            api.VideoGrants(
                room_join=True,
                room=room,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .to_jwt()
    )
    return TokenResponse(token=token, url=s.livekit_url, room=room, identity=identity)

import re

from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url: str) -> str | None:
    """
    Extract a YouTube video ID from common YouTube URL formats.
    """

    patterns = [
        r"(?:youtube\.com/watch\?v=)([^&]+)",
        r"(?:youtu\.be/)([^?&]+)",
        r"(?:youtube\.com/shorts/)([^?&]+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, url)

        if match:
            return match.group(1)

    return None


def extract_youtube_transcript(
    url: str,
) -> str | None:
    """
    Fetch a YouTube transcript and return it as plain text.

    Returns None when:
    - the URL is invalid
    - no video ID can be extracted
    - transcript is unavailable
    - another extraction error occurs
    """

    video_id = extract_video_id(url)

    if not video_id:
        print(f"Could not extract YouTube video ID: {url}")
        return None

    try:
        api = YouTubeTranscriptApi()

        transcript = api.fetch(video_id)

        text = " ".join(
            snippet.text
            for snippet in transcript
        )

        text = text.strip()

        if not text:
            return None

        return text

    except Exception as error:
        print(
            f"YouTube transcript unavailable "
            f"for {video_id}: {error}"
        )

        return None
import trafilatura


def extract_webpage(
    url: str,
) -> str | None:
    """
    Fetch a webpage and extract its main readable text.

    Returns None when the webpage cannot be fetched
    or meaningful text cannot be extracted.
    """

    try:
        downloaded = trafilatura.fetch_url(url)

        if not downloaded:
            print(
                f"Could not download webpage: {url}"
            )
            return None

        text = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=True,
            include_links=False,
        )

        if not text:
            print(
                f"Could not extract readable text: {url}"
            )
            return None

        text = text.strip()

        if not text:
            return None

        return text

    except Exception as error:
        print(
            f"Web extraction failed for {url}: {error}"
        )

        return None
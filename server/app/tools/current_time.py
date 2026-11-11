from datetime import datetime
from zoneinfo import ZoneInfo


def get_current_time(time_zone: str) -> dict[str, str]:
    now = datetime.now(ZoneInfo(time_zone))
    return {
        "timeZone": time_zone,
        "dateTime": now.strftime("%Y年%m月%d日 %A %H:%M:%S %Z"),
        "iso": now.isoformat(),
    }

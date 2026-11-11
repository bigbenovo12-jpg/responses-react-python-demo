from typing import Any

from app.tools.current_time import get_current_time

TOOLS = [
    {
        "type": "function",
        "name": "get_current_time",
        "description": "获取指定时区的当前日期和时间。用户询问现在几点或当前日期时使用。",
        "parameters": {
            "type": "object",
            "properties": {
                "timeZone": {
                    "type": "string",
                    "description": "IANA 时区名称，例如 Asia/Shanghai 或 America/New_York",
                }
            },
            "required": ["timeZone"],
            "additionalProperties": False,
        },
        "strict": True,
    }
]


def execute_tool(name: str, arguments: dict[str, Any]) -> tuple[dict[str, str], str]:
    if name == "get_current_time":
        time_zone = str(arguments["timeZone"])
        return get_current_time(time_zone), f"{name}({time_zone})"
    return {"message": f"未实现的函数：{name}"}, f"{name}()"

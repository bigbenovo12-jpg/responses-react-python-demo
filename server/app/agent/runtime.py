import json

from app.agent.prompts import INITIAL_INSTRUCTIONS, TOOL_RESULT_INSTRUCTIONS
from app.api.schemas.chat import ChatMessage
from app.providers.client import create_model_response
from app.tools.registry import TOOLS, execute_tool


def run_agent(messages: list[ChatMessage]) -> dict[str, object]:
    input_items = [{"role": item.role, "content": item.content} for item in messages]

    print("[chat] Sending initial Responses API request with tools", flush=True)
    response = create_model_response(
        instructions=INITIAL_INSTRUCTIONS,
        input_items=input_items,
        tools=TOOLS,
    )
    print(
        f"[chat] Initial response received; output types: {[item.type for item in response.output]}",
        flush=True,
    )

    called_functions: list[str] = []

    while any(item.type == "function_call" for item in response.output):
        tool_outputs = []

        for item in response.output:
            if item.type != "function_call":
                continue

            args = json.loads(item.arguments)
            result, call_label = execute_tool(item.name, args)
            called_functions.append(call_label)
            tool_outputs.append(
                {
                    "type": "function_call_output",
                    "call_id": item.call_id,
                    "output": json.dumps(result, ensure_ascii=False),
                }
            )

        # Keep the model's function-call items and append the matching tool results.
        input_items.extend(response.output)
        input_items.extend(tool_outputs)

        print("[chat] Sending function result back to the model", flush=True)
        response = create_model_response(
            instructions=TOOL_RESULT_INSTRUCTIONS,
            input_items=input_items,
            tools=TOOLS,
        )
        print("[chat] Follow-up response received", flush=True)

    print("[chat] Returning final answer to the frontend", flush=True)
    return {"text": response.output_text, "calledFunctions": called_functions}

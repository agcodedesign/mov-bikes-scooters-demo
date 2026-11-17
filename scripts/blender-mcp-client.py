"""Use the installed official Blender MCP server through its MCP stdio transport."""
import asyncio
import json
import sys
from pathlib import Path
from datetime import timedelta
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    executable = Path.home() / '.blender_mcp/mcp/.venv/Scripts/blender-mcp.exe'
    async with stdio_client(StdioServerParameters(command=str(executable))) as (reader, writer):
        async with ClientSession(reader, writer, read_timeout_seconds=timedelta(seconds=300)) as session:
            await session.initialize()
            if len(sys.argv) == 1:
                result = await session.list_tools()
                print(json.dumps([{'name': tool.name, 'description': tool.description[:130]} for tool in result.tools], indent=2))
            else:
                code = Path(sys.argv[1]).read_text(encoding='utf-8')
                result = await session.call_tool('execute_blender_code', {'code': code})
                print(result.model_dump_json(indent=2))

if __name__ == '__main__':
    asyncio.run(main())

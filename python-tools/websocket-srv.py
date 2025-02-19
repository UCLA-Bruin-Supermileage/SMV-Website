# This is a trivial websocket server that allows you to send messages through the terminal

import asyncio
import websockets

clients = set()

async def handle_client(websocket):
    clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        clients.remove(websocket)


async def send_messages():
    while True:
        message = await asyncio.to_thread(input, "Enter message: ")
        await asyncio.gather(*[client.send(message) for client in clients])

async def main():
    server = await websockets.serve(handle_client, "0.0.0.0", 8765)

    print("WebSocket server started on ws://localhost:8765")
    
    await asyncio.gather(server.wait_closed(), send_messages())

if __name__ == "__main__":
    asyncio.run(main())

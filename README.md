# OnePageLiveChat

Live chat webapp.

The project is organized into three main folders: backend, frontend, and websocket.

The backend and frontend folders contain a live chat web application implemented using the long-polling technique. This application is deployed as a standalone service in a separate Coolify project.

The websocket folder contains a real-time live chat application that supports two communication techniques: WebSocket and long-polling. Both approaches share a common backend and reuse as much of the codebase as possible. Each communication method, however, has its own dedicated frontend implementation.

Due to the structure of the original project—where the initial implementation has interconnected HTML pages—fully separating the frontend codebases required additional refactoring and design considerations.

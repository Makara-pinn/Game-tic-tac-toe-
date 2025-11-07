# Tic-Tac-Toe Flask App

A simple Tic-Tac-Toe web app built with Flask (backend) and vanilla JavaScript (frontend). The AI move endpoint currently selects a random empty cell.

## Features
- **Flask backend** serving HTML templates and static assets
- **AI endpoint** (`/ai_move`) returns a random valid move
- **Static assets** served from `static/` and images from `img/`

## Tech Stack
- Python + Flask
- HTML/CSS/JavaScript

## Prerequisites
- Python 3.8+
- pip

## Setup
1. (Optional) Create and activate a virtual environment (Windows PowerShell):
   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. Install dependencies:
   ```powershell
   pip install Flask
   ```

## Run
```powershell
python app.py
```
Then open http://127.0.0.1:5000/ (or the URL shown in the terminal).

## API
- **POST** `/ai_move`
  - Request JSON:
    ```json
    {
      "board": ["X", "", "O", ...],
      "size": 3,
      "ai_symbol": "O"
    }
    ```
  - Response JSON:
    ```json
    { "index": 4 }
    ```
  - Returns `index: null` when no moves are available.

## Static Files
- Images served from `/img/<filename>`

## Project Structure
```
.
├─ app.py
├─ README.md
├─ img/
├─ js/
│  └─ app.js
├─ static/
│  ├─ css/
│  │  └─ style.css
│  └─ js/
│     └─ app.js
├─ templates/
│  └─ index.html
└─ tic-tactoe-flask/
```

## Notes
- The development server runs with `debug=True` in `app.py`. Disable for production.
- The AI currently chooses a random empty cell; replace with your strategy as needed.

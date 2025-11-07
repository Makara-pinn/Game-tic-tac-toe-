from flask import Flask, render_template, request, jsonify

import random
from flask import send_from_directory

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/ai_move", methods=["POST"])
@app.route("/api/ai-move", methods=["POST"])  # match frontend AI_ENDPOINT
def ai_move():
    data = request.get_json()
    board = data.get("board", [])
    size = data.get("size", 3)
    ai_symbol = data.get("ai_symbol", "O")

    empty_indices = [i for i, v in enumerate(board) if v == ""]
    if not empty_indices:
        return jsonify({"index": None})

    choice = random.choice(empty_indices)
    return jsonify({"index": choice})

# Serve images from the existing 'img' folder
@app.route('/img/<path:filename>')
def serve_img(filename):
    return send_from_directory('img', filename)

if __name__ == "__main__":
    app.run(debug=True)

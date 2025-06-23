from flask import Flask, request, render_template, redirect, url_for
import uuid
import random

app = Flask(__name__)
participants = {}

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        subscribe = request.form.get("subscribe")
        if subscribe != "on":
            return render_template("index.html", error="You must subscribe to proceed.", link=None)

        user_id = str(uuid.uuid4())
        participants[user_id] = {"name": name, "email": email}
        link = url_for('result', id=user_id, _external=True)
        return render_template("index.html", link=link, error=None)
    return render_template("index.html", link=None, error=None)

@app.route("/result")
def result():
    user_id = request.args.get("id")
    user = participants.get(user_id)
    if not user:
        return "Invalid or expired link."

    winner = random.choice(list(participants.keys()))
    is_winner = (user_id == winner)
    return render_template("result.html", user=user, is_winner=is_winner)

if __name__ == "__main__":
    app.run(debug=True)
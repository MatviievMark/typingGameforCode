from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/selectLength")
def selectLength():
    return render_template("selectTypingLength.html")

@app.route("/typing")
def typing():
    return render_template("typing.html")


if __name__ == "__main__":
    app.run(debug=True)

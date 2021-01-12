from flask import Flask, render_template, jsonify, request
from db import db

app = Flask(__name__)

@app.route('/')
def main_page():
   return render_template('main.html')

@app.route('/pogoda', methods=['GET', 'POST'])
def get_weather():

    if request.method == "GET":
        pogoda = db.weather.find()
        return render_template('wszystkie.html', pogoda=pogoda)

    if request.method == "POST":
        db.weather.insert_one(request.form.to_dict())
        return render_template('dodano.html')

if __name__ == '__main__':
    app.run(debug=True)

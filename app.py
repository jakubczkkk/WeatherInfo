from flask import Flask, render_template, request, url_for, redirect, session
from db import db

app = Flask(__name__)
app.secret_key = 'dsadawdw3231qw'

@app.route('/')
def index():
   return render_template('main.html')

@app.route('/pogoda', methods=['GET', 'POST'])
def add_weather_info():

    if request.method == "GET":
        pogoda = db.weather.find()
        return render_template('wszystkie.html', pogoda=pogoda)

    if request.method == "POST":
        db.weather.insert_one(request.form.to_dict())
        return redirect(url_for('index'))

@app.route('/login', methods=['GET', 'POST'])
def login():

    if request.method == 'POST':
        session['username'] = request.form['username']
        return redirect(url_for('index'))

    if request.method == 'GET':
        return render_template('login.html')

@app.route('/logout')
def logout():
    
    session.pop('username', None)
    return redirect(url_for('index'))

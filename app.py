from flask import Flask, render_template, request, make_response
from flask_restful import Resource, Api, reqparse

app = Flask(__name__)
api = Api(app)

# class HelloWorld(Resource):
#     def get(self):
#         return {'hello': 'world'}

pogoda = []

parser = reqparse.RequestParser()
parser.add_argument('place', type=str)
parser.add_argument('day', type=str)
parser.add_argument('temperature', type=float)
parser.add_argument('other', type=str)

class Weather(Resource):

    def post(self):
        args = parser.parse_args()
        pogoda.append(args)
        return make_response(render_template('test.html'))

    def get(self):
        return make_response(render_template('all.html', data=pogoda))

api.add_resource(Weather, '/pogoda')

@app.route('/')
def main_page():
   return render_template('main.html')

if __name__ == '__main__':
    app.run(debug=True)

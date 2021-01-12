from flask import Flask
from pymongo import MongoClient

CONNECTION_STRING = "mongodb+srv://user:pass@cluster.9vk28.mongodb.net/db_weather?retryWrites=true&w=majority"

client = MongoClient(CONNECTION_STRING)
db = client.db_weather

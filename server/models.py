from flask_sqlalchemy import SQLAlchemy
from flask import Flask
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://travarit_test:Kiotel123!@box2272.bluehost.com/travarit_login'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Ticket(db.Model):
    __tablename__ = 'tbltickets'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    attachments = db.Column(db.JSON, nullable=True)  # Store JSON array of attachment filenames

    def __init__(self, title, description, attachments):
        self.title = title
        self.description = description
        self.attachments = json.dumps(attachments) if attachments else json.dumps([])

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'attachments': json.loads(self.attachments)  # Convert JSON string back to Python list
        }

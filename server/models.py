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


# hello this is the way you should be doing the same in the logins as well as the hell you should be 
# doing the same in the locals of the logins in the same in the light as well as they are doing t
# hello as well as this is the way you should be doing the same as they are only the 
# they only one you should be doing is the same thing in the way you have as well as they in the logins
# hello the todfod karega kya re tu, hello this is the way you should be doing the same thing in the logins as well as they
# hello so this could be the only one which is the same in the cassual outing of the logins in the same affeacted
# so this is the well this could be allocated in the once as well as well this is the 
# This showes the welt why there are the doing in the local value of the going in the would 
# hello this is the way you should be doing self description as well as attachments attachments in the
# in the self observance in the locals as well as the vanguad in the local hight
# the new hights as wellas the /api users in the local viginaity which meants /api/user of the local
# local value of the visignity as well as they are they can be doing in the local healts as well as the
# so this could be doing the same thing in the viginity of the values as they are arround in the corner.
# so this is the could be able to same thing in the viginity of the values as they are around in the
# so hello this is the could be able to value the reputation of the prestige as well as they are getting in the area of th
# well therefore pi squere in the light weigh announcements key as they reflex the value
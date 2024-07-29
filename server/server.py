from flask import Flask, request, jsonify, session
from flask_cors import CORS
import pymysql
import json
from functools import wraps
from flask import redirect, url_for
import datetime
from models import db, Ticket
import os
from flask import send_from_directory



app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure the session
app.config["SECRET_KEY"] = "abcdefghijklmnopqrstuvwxyz"
app.config["SESSION_TYPE"] = "filesystem"

# Directory for saving uploads
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Ensure the upload directory exists

def create_connection():
    try:
        connection = pymysql.connect(
            host="box2272.bluehost.com",
            user="travarit_test",
            password="Kiotel123!",
            database="travarit_login",
            cursorclass=pymysql.cursors.DictCursor
        )
        print("Successfully connected to the database")
        return connection
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

@app.route("/api/signin", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]

    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor() as cursor:
            cursor.callproc('Proc_tblUsers_CheckCredentials', (email, password, 0))
            cursor.execute("SELECT @_Proc_tblUsers_CheckCredentials_2")
            result = cursor.fetchone()
            credentials_valid = result['@_Proc_tblUsers_CheckCredentials_2']
            
            if credentials_valid == 1:
                cursor.execute("SELECT * FROM tblusers WHERE emailid = %s", (email,))
                user = cursor.fetchone()
                session["user_id"] = user['id']
                session.permanent = True  # Make the session permanent (cookie won't be deleted after the browser is closed)
                return jsonify({
                    "id": user['id'],
                    "email": user['emailid']
                })
            else:
                return jsonify({"error": "Unauthorized"}), 401
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        connection.close()

@app.route("/api/register", methods=["POST"])
def register_user():
    email = request.json["email"]
    password = request.json["password"]

    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM tblusers WHERE emailid = %s", (email,))
            user_exists = cursor.fetchone() is not None

            if user_exists:
                return jsonify({"error": "User already exists"}), 409

            cursor.callproc('Proc_tblUsers_RegisterUser', (email, password))
            connection.commit()

            cursor.execute("SELECT * FROM tblusers WHERE emailid = %s", (email,))
            new_user = cursor.fetchone()

            session["user_id"] = new_user['id']
            session.permanent = True  # Make the session permanent (cookie won't be deleted after the browser is closed)

            return jsonify({
                "id": new_user['id'],
                "email": new_user['emailid']
            })
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        connection.close()

@app.route("/Dashboard")
@login_required
def dashboard():
    return "Welcome to the Dashboard!"


# @app.route("/api/ticket", methods=["POST"])
# def create_ticket():
    title = request.form.get("title")
    description = request.form.get("description")
    attachments = request.files.getlist("attachments")
    # current_datetime = datetime.datetime.now()

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        attachment_filenames = []
        with connection.cursor() as cursor:
            # Convert list of filenames to JSON string
            if attachments:
                for attachment in attachments:
                    filename = attachment.filename
                    attachment_filenames.append(filename)
                    attachment.save(os.path.join(UPLOAD_FOLDER, filename))
            
            attachments_json = json.dumps(attachment_filenames)
            cursor.callproc('Proc_tbltickets_Insertticket', (title, description, attachments_json))
            connection.commit()

            # Retrieve the ticket_id
            cursor.execute("SELECT LAST_INSERT_ID() AS ticket_id")
            ticket_id = cursor.fetchone()["ticket_id"]

            return jsonify({"message": "Ticket created successfully", "ticket_id": ticket_id}), 201
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()




    


# New added after sending ZIP file to kshiti




# @app.route("/api/opened_tickets", methods=["GET"])
# @login_required
# def get_opened_tickets():
#     connection = create_connection()
#     if connection is None:
#         return jsonify({"error": "Failed to connect to the database"}), 500

#     try:
#         with connection.cursor() as cursor:
#             cursor.execute("SELECT id, title, description, created_at FROM tbltickets ORDER BY created_at DESC LIMIT 5")
#             opened_tickets = cursor.fetchall()
#             return jsonify(opened_tickets), 200
#     except pymysql.MySQLError as e:
#         print(f"The error '{e}' occurred")
#         return jsonify({"error": "Database query failed"}), 500
#     finally:
#         connection.close()

@app.route("/api/opened_tickets", methods=["GET"])
@login_required
def get_opened_tickets():
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # Call the stored procedure
            cursor.callproc("Proc_tbltickets_DisplayOpenedtickets")
            
            # Fetch the result
            opened_tickets = cursor.fetchall()
            
            # Print raw result for debugging
            print("Raw result:", opened_tickets)

            # Decode bytes fields to strings, if any
            for ticket in opened_tickets:
                for key, value in ticket.items():
                    if isinstance(value, bytes):
                        ticket[key] = value.decode("utf-8")

            return jsonify(opened_tickets), 200
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()





# @app.route("/api/tickets/<int:ticket_id>", methods=["GET"])
# @login_required
# def get_ticket(ticket_id):
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # Execute the procedure
            cursor.callproc("Proc_tbltickets_DisplayticketsById", (ticket_id,))
            
            # Fetch the result
            result = cursor.fetchall()
            
            # Print raw result for debugging
            print("Raw result:", result)
            
            if not result:
                return jsonify({"error": "Ticket not found"}), 404

            ticket = result[0]

            # Decode bytes fields to strings, if any
            for key, value in ticket.items():
                if isinstance(value, bytes):
                    ticket[key] = value.decode("utf-8")

            # Ensure 'attachments' is a list if it's a JSON string
            if 'attachments' in ticket and isinstance(ticket['attachments'], str):
                ticket['attachments'] = json.loads(ticket['attachments'])

            return jsonify(ticket)
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()


@app.route("/api/latest_opened_tickets", methods=["GET"])
@login_required
def get_latest_opened_tickets():
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # Call the stored procedure for the latest 5 opened tickets
            cursor.callproc("Proc_tbltickets_DispalyTop5Openedtickets")
            
            # Fetch the result
            latest_opened_tickets = cursor.fetchall()
            
            # Print raw result for debugging
            print("Raw result:", latest_opened_tickets)

            # Decode bytes fields to strings, if any
            for ticket in latest_opened_tickets:
                for key, value in ticket.items():
                    if isinstance(value, bytes):
                        ticket[key] = value.decode("utf-8")

            return jsonify(latest_opened_tickets), 200
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()





@app.route("/api/closed_tickets", methods=["GET"])
@login_required
def get_closed_tickets():
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # Call the stored procedure for closed tickets
            cursor.callproc("Proc_tbltickets_DisplayClosedtickets")
            
            # Fetch the result
            closed_tickets = cursor.fetchall()
            
            # Print raw result for debugging
            print("Raw result:", closed_tickets)

            # Decode bytes fields to strings, if any
            for ticket in closed_tickets:
                for key, value in ticket.items():
                    if isinstance(value, bytes):
                        ticket[key] = value.decode("utf-8")

            return jsonify(closed_tickets), 200
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()





@app.route("/api/ticket", methods=["POST"])
def create_ticket():
    title = request.form.get("title")
    description = request.form.get("description")
    attachments = request.files.getlist("attachments")

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        attachment_filenames = []
        with connection.cursor() as cursor:
            if attachments:
                for attachment in attachments:
                    filename = attachment.filename
                    attachment_filenames.append(filename)
                    attachment.save(os.path.join(UPLOAD_FOLDER, filename))
            
            attachments_json = json.dumps(attachment_filenames)
            cursor.callproc('Proc_tbltickets_Insertticket', (title, description, attachments_json))
            connection.commit()

            cursor.execute("SELECT LAST_INSERT_ID() AS ticket_id")
            ticket_id = cursor.fetchone()["ticket_id"]

            return jsonify({"message": "Ticket created successfully", "ticket_id": ticket_id}), 201
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()

@app.route("/api/tickets/<int:ticket_id>", methods=["GET"])
@login_required
def get_ticket(ticket_id):
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.callproc("Proc_tbltickets_DisplayticketsById", (ticket_id,))
            result = cursor.fetchall()
            
            if not result:
                return jsonify({"error": "Ticket not found"}), 404

            ticket = result[0]

            for key, value in ticket.items():
                if isinstance(value, bytes):
                    ticket[key] = value.decode("utf-8")

            if 'attachments' in ticket and isinstance(ticket['attachments'], str):
                ticket['attachments'] = json.loads(ticket['attachments'])

            return jsonify(ticket), 200
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()


@app.route('/uploads/<filename>', methods=['GET'])
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)







@app.route("/api/tickets/<int:ticket_id>/reply", methods=["POST"])
def reply_to_ticket(ticket_id):
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        title = request.form.get("title")
        description = request.form.get("description")

        # Process attachments
        attachments = request.files.getlist("attachments")
        attachment_paths = []
        upload_folder = 'uploads/replies'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        for file in attachments:
            if file:
                file_path = os.path.join(upload_folder, file.filename)
                file.save(file_path)
                attachment_paths.append(file.filename)

        with connection.cursor() as cursor:
            # Insert reply into database
            cursor.execute(
                "INSERT INTO tblreplies (ticket_id, title, description) VALUES (%s, %s, %s)",
                (ticket_id, title, description)
            )
            reply_id = cursor.lastrowid

            # Insert attachment records
            for attachment in attachment_paths:
                cursor.execute(
                    "INSERT INTO tblattachments (reply_id, filename) VALUES (%s, %s)",
                    (reply_id, attachment)
                )
            connection.commit()

        return jsonify({"message": "Reply submitted successfully", "reply_id": reply_id}), 201

    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()



@app.route("/api/tickets/<int:ticket_id>/title", methods=["GET"])
def get_ticket_title(ticket_id):
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT title FROM tbltickets WHERE id = %s", (ticket_id,))
            ticket = cursor.fetchone()
            if not ticket:
                return jsonify({"error": "Ticket not found"}), 404
            
            return jsonify({"title": ticket["title"]})

    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()



        
if __name__ == '__main__':
    app.run(debug=True, port=8080)









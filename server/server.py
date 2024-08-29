from ssl import SSLError
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
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# def create_connection():
#     try:
#         connection = pymysql.connect(
#             host="box2272.bluehost.com",
#             user="travarit_test",
#             password="Kiotel123!",
#             database="travarit_login",
#             cursorclass=pymysql.cursors.DictCursor
#         )
#         print("Successfully connected to the database")
#         return connection
#     except pymysql.MySQLError as e:
#         print(f"The error '{e}' occurred")
#         return None

def create_connection():
    try:
        connection = pymysql.connect(
            host="64.227.6.9",  # Replace with the public IP address of your VPS
            user="kshiti",  # Replace with your MySQL user
            password="Kiotel123!",  # Replace with your MySQL password
            database="kiotel",  # Replace with your database name
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
            return redirect(url_for("login_user"))
        return f(*args, **kwargs)
    return decorated_function



@app.route("/api/signin", methods=["POST"])
def login_user():
    email = request.json.get("email")
    password = request.json.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.callproc('Proc_tblUsers_CheckCredentials', (email, password, 0))
            cursor.execute("SELECT @_Proc_tblUsers_CheckCredentials_2")
            result = cursor.fetchone()
            credentials_valid = result.get('@_Proc_tblUsers_CheckCredentials_2')

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


@app.route("/api/user-email", methods=["GET"])
@login_required
def get_user_email():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM tblusers WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if user:
                return jsonify({"name": user['fname'], "role": user["role_id"]})
            else:
                return jsonify({"error": "User not found"}), 404
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        connection.close()

# @app.route("/api/register", methods=["POST"])
# def register_user():
#     data = request.json
#     email = data["email"]
#     password = data["password"]
#     fname = data.get("fname")
#     lname = data.get("lname")
#     dob = data.get("dob")
#     address = data.get("address")
#     account_no = data.get("account_no")
#     mobileno = data.get("mobileno")
#     role_id = data.get("role_id", 2)  # Assuming 1 is the default role_id for new users

#     connection = create_connection()
#     if connection is None:
#         return jsonify({"error": "Failed to connect to the database"}), 500

#     try:
#         with connection.cursor() as cursor:
#             # Check if the user already exists
#             cursor.execute("SELECT * FROM tblusers WHERE emailid = %s", (email,))
#             user_exists = cursor.fetchone() is not None

#             if user_exists:
#                 return jsonify({"error": "User already exists"}), 409

#             # Call the stored procedure to insert the new user
#             cursor.callproc('Proc_tblusers_Upsert', (0, email, password, fname, lname, dob, address, account_no, mobileno, role_id))
#             connection.commit()

#             # Fetch the newly created user
#             cursor.execute("SELECT * FROM tblusers WHERE emailid = %s", (email,))
#             new_user = cursor.fetchone()

#             session["user_id"] = new_user['id']
#             session.permanent = True  # Make the session permanent (cookie won't be deleted after the browser is closed)

#             return jsonify({
#                 "id": new_user['id'],
#                 "email": new_user['emailid']
#             })
#     except pymysql.MySQLError as e:
#         print(f"The error '{e}' occurred")
#         return jsonify({"error": "Database query failed"}), 500
#     finally:
#         connection.close()


@app.route("/api/register", methods=["POST"])
def register_user():
    data = request.json
    user_id = data.get("id", 0)  # Get the user ID; default to 0 for new users
    email = data["email"]
    password = data["password"]
    fname = data.get("fname")
    lname = data.get("lname")
    dob = data.get("dob")
    address = data.get("address")
    account_no = data.get("account_no")
    mobileno = data.get("mobileno")
    role_id = data.get("role_id", 2)  # Default role_id is 2

    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor() as cursor:
            # If user_id > 0, update the user; otherwise, insert a new user
            cursor.callproc('Proc_tblusers_Upsert', (user_id, email, password, fname, lname, dob, address, account_no, mobileno, role_id))
            connection.commit()

            # Fetch the user (whether newly created or updated)
            cursor.execute("SELECT * FROM tblusers WHERE emailid = %s", (email,))
            user = cursor.fetchone()

            session["user_id"] = user['id']
            session.permanent = True  # Make the session permanent

            return jsonify({
                "id": user['id'],
                "email": user['emailid']
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

# New added after sending ZIP file to kshiti

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







@app.route("/api/latest_opened_tickets", methods=["GET"])
@login_required
def get_latest_opened_tickets():
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # Call the stored procedure for the latest 5 opened tickets
            cursor.callproc("Proc_tbltickets_DisplayTop5Openedtickets")
            
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


@app.route("/api/latestclosed", methods=["GET"])
@login_required
def get_latest_closed_tickets():
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor() as cursor:
            cursor.callproc("Proc_tbltickets_DisplayTop5Closedtickets")
            result = cursor.fetchall()

            for ticket in result:
                for key, value in ticket.items():
                    if isinstance(value, bytes):
                        ticket[key] = value.decode("utf-8")

                if 'attachments' in ticket and isinstance(ticket['attachments'], str):
                    ticket['attachments'] = json.loads(ticket['attachments'])

            return jsonify(result), 200
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
@login_required
def create_ticket():
    user_id = session.get("user_id")

    if user_id is None:
        return jsonify({"error": "User ID not found in session"}), 400

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
        upload_folder = app.config['UPLOAD_FOLDER']

        with connection.cursor() as cursor:
            if attachments:
                for attachment in attachments:
                    filename = attachment.filename
                    attachment_filenames.append(filename)
                    file_path = os.path.join(upload_folder, filename)
                    attachment.save(file_path)

            attachments_json = json.dumps(attachment_filenames)

            # Set the session variable for the current user ID
            cursor.execute("SET @current_user_id = %s", (user_id,))

            # Set status_id to 1 (assumed 'Open' status)
            status_id = 1

            # Call the stored procedure with the parameters including status_id
            cursor.callproc('Proc_tblticketstest_UpsertTicket', (0, title, description, attachments_json, status_id))
            connection.commit()

            cursor.execute("SELECT LAST_INSERT_ID() AS ticket_id")
            ticket_id = cursor.fetchone()["ticket_id"]

            return jsonify({"message": "Ticket created successfully", "ticket_id": ticket_id}), 201
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": str(e)}), 500
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

            # Debugging: Print result for verification
            print("Query Result:", result)

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



@app.route('/api/status', methods=['GET'])
def get_status():
    conn = create_connection()
    if conn is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.callproc('Proc_tblstatus_Selectstatusfordropdown')
            status_options = cursor.fetchall()
            
            # Print raw result for debugging
            print("Raw result:", status_options)

            return jsonify(status_options), 200

    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        conn.close()


@app.route('/api/roles', methods=['GET'])
def get_roles():
    conn = create_connection()
    if conn is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.callproc('Proc_tblrole_selectrolefordropdown')
            roles_options = cursor.fetchall()
            
            # Print raw result for debugging
            print("Raw result:", roles_options)

            return jsonify(roles_options), 200

    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        conn.close()




# By kshiti

@app.route("/api/tickets/<int:ticket_id>/reply", methods=["POST"])
def reply_to_ticket(ticket_id):
    print(f"Received request for ticket ID: {ticket_id}")
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        description = request.form.get("description")
        status_id = int(request.form.get("status_id", 1))  # Convert to integer and default to 1 if missing

        # Fetch user_id from the session
        user_id = session.get('user_id')
        if user_id is None:
            return jsonify({"error": "User not logged in"}), 401

        # Process attachments
        attachments = request.files.getlist("attachments")
        attachment_list = []
        upload_folder = 'uploads/replies'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        for file in attachments:
            if file:
                file_path = os.path.join(upload_folder, file.filename)
                file.save(file_path)
                attachment_list.append(file.filename)

        # Convert the list to a JSON string
        attachment_json = json.dumps(attachment_list)

        with connection.cursor() as cursor:
            # Call stored procedure to insert or update reply
            cursor.callproc('Proc_tblreplies_UpsertReply', [
                0,  # Assuming 0 means a new reply, adjust if necessary
                ticket_id,
                description,
                user_id,
                status_id,
                attachment_json
            ])
            connection.commit()

        return jsonify({"message": "Reply submitted successfully"}), 201

    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        connection.close()


@app.route("/api/ticket/<int:ticket_id>/replies", methods=["GET"])
@login_required
def get_replies_by_ticket_id(ticket_id):
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.callproc("Proc_tblreplies_SelectRepliesByTicketId", (ticket_id,))
            replies = cursor.fetchall()

            # Decode bytes fields to strings, if any
            for reply in replies:
                for key, value in reply.items():
                    if isinstance(value, bytes):
                        reply[key] = value.decode("utf-8")

            return jsonify(replies), 200
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
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



# @app.route('/api/users', methods=['GET'])
# def get_users():
#     user_id = request.args.get('user_id', type=int)

#     if not user_id:
#         return jsonify({"error": "User ID is required"}), 400

#     conn = create_connection()
#     if conn is None:
#         return jsonify({"error": "Failed to connect to the database"}), 500

#     try:
#         with conn.cursor(pymysql.cursors.DictCursor) as cursor:
#             cursor.callproc('Proc_tblusers_displaylistofusers2', (user_id,))
#             users = cursor.fetchall()

#             if not users:
#                 return jsonify({"error": "No user found with the given ID"}), 404

#             return jsonify(users), 200

#     except pymysql.MySQLError as e:
#         print(f"The error '{e}' occurred")
#         return jsonify({"error": "Database query failed"}), 500

#     finally:
#         conn.close()



# Route to display user details based on user ID
# @app.route('/api/users', methods=['GET'])
# def get_users():
#     connection = create_connection()
#     if connection is None:
#         return jsonify({"error": "Failed to connect to the database"}), 500

#     try:
#         with connection.cursor() as cursor:
#             # Call the stored procedure to get the list of all users
#             cursor.callproc('Proc_tblusers_displaylistofusers_test')
#             users = cursor.fetchall()  # Fetch all results
            
#             if not users:
#                 return jsonify({"error": "No users found"}), 404

#             # Convert the result to a list of dictionaries
#             users_list = []
#             for user in users:
#                 users_list.append({
#                     "id": user[0],
#                     "fname": user[1],
#                     "lname": user[2],
#                     "emailid": user[3],
#                     "role": user[4],
#                     # Add other fields as necessary
#                 })

#             return jsonify(users_list)
            
#     except pymysql.MySQLError as e:
#         print(f"The error '{e}' occurred")
#         return jsonify({"error": "Database query failed"}), 500
#     finally:
#         connection.close()


@app.route('/api/users', methods=['GET'])
def get_users():
    connection = create_connection()
    if connection is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # Call the stored procedure to get the list of all users
            cursor.callproc('Proc_tblusers_displaylistofusers_test')
            users = cursor.fetchall()  # Fetch all results
            
            if not users:
                return jsonify({"error": "No users found"}), 404

            # Convert the result to a list of dictionaries
            users_list = []
            for user in users:
                users_list.append({
                    "id": user['id'],
                    "fname": user['fname'],
                    "lname": user['lname'],
                    "emailid": user['emailid'],
                    "role": user['role'],
                    # Add other fields as necessary
                })

            return jsonify(users_list)
            
    except pymysql.MySQLError as e:
        print(f"The error '{e}' occurred")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        connection.close()





        
if __name__ == '__main__':
    app.run(debug=True, port=8080)









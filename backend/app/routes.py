from flask import Blueprint, request, jsonify
from datetime import date, datetime, timedelta
from .database import get_db_connection

main_routes = Blueprint('main_routes', __name__)

# Helper to convert sqlite3.Row to dict
def row_to_dict(row):
    return dict(row) if row else None

def rows_to_dict_list(rows):
    return [dict(row) for row in rows]

# --- Homepage ---
@main_routes.route('/')
def home():
    return jsonify({"status": "running", "message": "HemoPulse API is live (SQLite)!"})

# --- Donor Registration ---
@main_routes.route('/api/register_donor', methods=['POST'])
def register_donor():
    data = request.json
    name = data.get('full_name')
    phone = data.get('phone')
    blood_group = data.get('blood_group')
    last_donation = data.get('last_donation_date') or None

    if not all([name, phone, blood_group]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM Donors WHERE phone = ?", (phone,))
        existing = cursor.fetchone()

        if existing:
            if existing['last_donation_date']:
                # Parse date string to date object for calculation
                last_date = datetime.strptime(existing['last_donation_date'], '%Y-%m-%d').date()
                days = (date.today() - last_date).days
                if days < 90:
                    return jsonify({"status": "not_eligible", "message": f"Wait {90 - days} more days."}), 400
            return jsonify({"status": "exists", "message": "Donor already registered."})

        cursor.execute("INSERT INTO Donors (full_name, phone, blood_group, last_donation_date) VALUES (?, ?, ?, ?)",
                       (name, phone, blood_group, last_donation))
        conn.commit()
        return jsonify({"status": "success", "message": "Donor registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- List Donors ---
@main_routes.route('/api/donors', methods=['GET'])
def get_donors():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM Donors ORDER BY created_at DESC")
        return jsonify(rows_to_dict_list(cursor.fetchall())), 200
    finally:
        conn.close()

# --- Inventory List ---
@main_routes.route('/api/inventory', methods=['GET'])
def get_inventory():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM BloodInventory ORDER BY created_at DESC")
        return jsonify(rows_to_dict_list(cursor.fetchall())), 200
    finally:
        conn.close()

# --- Add Manual Stock ---
@main_routes.route('/api/add_inventory', methods=['POST'])
def add_inventory():
    data = request.json
    if not all([data.get('blood_group'), data.get('component_type'), data.get('quantity'), data.get('expiry_date')]):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO BloodInventory (blood_group, component_type, quantity, expiry_date) VALUES (?, ?, ?, ?)",
                       (data['blood_group'], data['component_type'], data['quantity'], data['expiry_date']))
        conn.commit()
        return jsonify({"status": "success", "message": "Stock added!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# --- NLP Chatbot ---
@main_routes.route('/api/chat', methods=['POST'])
def chat_assistant():
    data = request.json
    user_message = data.get('message', '').lower()

    if any(word in user_message for word in ['hello', 'hi', 'hey', 'help']):
        response = "Hello! Ask me about eligibility, weight limits, the 90-day gap, or tattoos."
    elif any(word in user_message for word in ['gap', 'days', 'wait', 'next', 'often']):
        response = "You must wait a minimum of 90 days (3 months) between whole blood donations."
    elif any(word in user_message for word in ['weight', 'kg', 'heavy']):
        response = "You must weigh at least 45 kg to donate whole blood safely."
    elif any(word in user_message for word in ['hemoglobin', 'hb', 'iron']):
        response = "Hemoglobin must be at least 12.5 g/dL for women and 13.0 g/dL for men."
    elif any(word in user_message for word in ['cold', 'flu', 'fever', 'sick']):
        response = "Wait until you are fully recovered and symptom-free for at least 7 days."
    elif any(word in user_message for word in ['tattoo', 'piercing']):
        response = "You must wait at least 6 months after getting a tattoo or piercing."
    else:
        response = "I didn't catch that. Try asking about the '90 day gap', 'weight limit', or 'tattoos'."

    return jsonify({"response": response}), 200

# --- SOS Alert ---
@main_routes.route('/api/sos', methods=['POST'])
def blood_sos():
    data = request.json
    blood_group = data.get('blood_group')
    if not blood_group: return jsonify({"error": "Missing blood group"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) as count FROM Donors WHERE blood_group = ? AND is_eligible = 1", (blood_group,))
        result = cursor.fetchone()
        count = result['count'] if result else 0
        return jsonify({"status": "success", "message": f"🚨 Alert sent to {count} eligible {blood_group} donors!", "donors_alerted": count}), 200
    finally:
        conn.close()

# --- Dashboard Stats ---
@main_routes.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) as total_donors FROM Donors")
        donors = cursor.fetchone()['total_donors']

        cursor.execute("SELECT SUM(quantity) as total_units FROM BloodInventory")
        units = cursor.fetchone()['total_units'] or 0

        cursor.execute("SELECT blood_group, SUM(quantity) as total FROM BloodInventory GROUP BY blood_group")
        chart_data = rows_to_dict_list(cursor.fetchall())

        return jsonify({"total_donors": donors, "total_units": units, "lives_saved": units * 3, "chart_data": chart_data}), 200
    finally:
        conn.close()

# --- Recent Activity ---
@main_routes.route('/api/recent_activity', methods=['GET'])
def recent_activity():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT full_name, blood_group, created_at FROM Donors ORDER BY created_at DESC LIMIT 5")
        recent_donors = rows_to_dict_list(cursor.fetchall())

        cursor.execute("SELECT blood_group, component_type, expiry_date FROM BloodInventory WHERE expiry_date <= date('now', '+30 days') ORDER BY expiry_date ASC LIMIT 3")
        expiring_soon = rows_to_dict_list(cursor.fetchall())

        return jsonify({"recent_donors": recent_donors, "expiring_soon": expiring_soon}), 200
    finally:
        conn.close()

# --- Yield Calculator ---
@main_routes.route('/api/process_donation', methods=['POST'])
def process_donation():
    data = request.json
    blood_group = data.get('blood_group')
    quantity = int(data.get('quantity', 1))
    expiry_date = data.get('expiry_date')

    if not all([blood_group, expiry_date]):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        platelet_expiry = (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
        components = [('RBC', quantity, expiry_date), ('Plasma', quantity, expiry_date), ('Platelets', quantity, platelet_expiry)]

        for comp_type, qty, exp in components:
            cursor.execute("INSERT INTO BloodInventory (blood_group, component_type, quantity, expiry_date) VALUES (?, ?, ?, ?)",
                           (blood_group, comp_type, qty, exp))
        conn.commit()
        return jsonify({"status": "success", "message": f"Processed {quantity} unit(s) of {blood_group} into RBC, Plasma, and Platelets!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
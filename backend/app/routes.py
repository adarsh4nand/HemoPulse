from flask import Blueprint, request, jsonify
from datetime import date
from .database import get_db_connection

main_routes = Blueprint('main_routes', __name__)

# --- Homepage (fixes your 404) ---
@main_routes.route('/')
def home():
    return jsonify({
        "status": "running",
        "message": "HemoPulse API is live!",
        "endpoints": ["/api/register_donor", "/api/donors", "/api/inventory", "/api/add_inventory"]
    })

# --- Donor Registration with 90-day rule ---
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
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Donors WHERE phone = %s", (phone,))
        existing = cursor.fetchone()

        if existing:
            if existing['last_donation_date']:
                days = (date.today() - existing['last_donation_date']).days
                if days < 90:
                    return jsonify({
                        "status": "not_eligible",
                        "message": f"Already registered. Wait {90 - days} more days to donate."
                    }), 400
            return jsonify({"status": "exists", "message": "Donor already registered and eligible."})

        cursor.execute(
            "INSERT INTO Donors (full_name, phone, blood_group, last_donation_date) VALUES (%s, %s, %s, %s)",
            (name, phone, blood_group, last_donation)
        )
        conn.commit()
        return jsonify({"status": "success", "message": "Donor registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- List all donors ---
@main_routes.route('/api/donors', methods=['GET'])
def get_donors():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Donors ORDER BY created_at DESC")
        donors = cursor.fetchall()
        for d in donors:
            for k in ['last_donation_date', 'created_at']:
                if d.get(k): d[k] = str(d[k])
        return jsonify(donors), 200
    finally:
        cursor.close()
        conn.close()

# --- Inventory list ---
@main_routes.route('/api/inventory', methods=['GET'])
def get_inventory():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM BloodInventory ORDER BY created_at DESC")
        items = cursor.fetchall()
        for i in items:
            for k in ['expiry_date', 'created_at']:
                if i.get(k): i[k] = str(i[k])
        return jsonify(items), 200
    finally:
        cursor.close()
        conn.close()

# --- Add stock ---
@main_routes.route('/api/add_inventory', methods=['POST'])
def add_inventory():
    data = request.json
    if not all([data.get('blood_group'), data.get('component_type'), data.get('quantity'), data.get('expiry_date')]):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO BloodInventory (blood_group, component_type, quantity, expiry_date) VALUES (%s, %s, %s, %s)",
            (data['blood_group'], data['component_type'], data['quantity'], data['expiry_date'])
        )
        conn.commit()
        return jsonify({"status": "success", "message": "Stock added!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# --- NLP CHATBOT ASSISTANT ---
# --- SMART NLP CHATBOT ASSISTANT ---
@main_routes.route('/api/chat', methods=['POST'])
def chat_assistant():
    data = request.json
    user_message = data.get('message', '').lower()

    # Expanded Keyword Dictionary for better NLP matching
    if any(word in user_message for word in ['hello', 'hi', 'hey', 'start', 'help']):
        response = "Hello! I am the HemoPulse AI Assistant. You can ask me about eligibility, weight limits, the 90-day gap, or what to do if you have a cold. Or just click one of the quick reply buttons below!"
        
    elif any(word in user_message for word in ['gap', 'days', 'wait', 'next', 'how long', 'frequency', 'often']):
        response = "According to NBTC/WHO guidelines, you must wait a minimum of 90 days (3 months) between whole blood donations to allow your body to replenish its red blood cells."
        
    elif any(word in user_message for word in ['weight', 'kg', 'heavy', 'light', 'pounds']):
        response = "To donate whole blood safely, you must weigh at least 45 kg (approx 99 lbs). For platelet donation, the requirement is usually 50 kg."
        
    elif any(word in user_message for word in ['hemoglobin', 'hb', 'blood count', 'iron', 'anemia']):
        response = "Your hemoglobin must be at least 12.5 g/dL for women and 13.0 g/dL for men. If you are anemic, please consult a doctor before donating."
        
    elif any(word in user_message for word in ['cold', 'flu', 'fever', 'sick', 'ill', 'cough', 'infection']):
        response = "You should wait until you have fully recovered from any illness. You must be symptom-free and off antibiotics for at least 7 days before donating."
        
    elif any(word in user_message for word in ['eligible', 'can i donate', 'am i allowed', 'age', 'years old']):
        response = "To be eligible, you must be between 18 and 65 years old, weigh over 45 kg, have safe hemoglobin levels, and not have donated in the last 90 days."
        
    elif any(word in user_message for word in ['tattoo', 'piercing', 'ink']):
        response = "If you have gotten a tattoo or piercing, you must wait at least 6 months before donating blood to ensure there is no risk of infection."

    elif any(word in user_message for word in ['medicine', 'medication', 'drugs', 'prescription']):
        response = "It depends on the medication. Please inform the camp doctor about any prescriptions you are taking. Generally, you cannot donate if you are on blood thinners or antibiotics."

    else:
        # Smart fallback that guides the user
        response = "I didn't quite catch that. Try asking about: '90 day gap', 'weight limit', 'hemoglobin', 'tattoos', or 'medications'. Or use the quick buttons below!"

    return jsonify({"response": response}), 200

# --- BLOOD SOS EMERGENCY ALERT ---
@main_routes.route('/api/sos', methods=['POST'])
def blood_sos():
    data = request.json
    blood_group = data.get('blood_group')
    if not blood_group:
        return jsonify({"error": "Missing blood group"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Count eligible donors with this blood group
        cursor.execute("SELECT COUNT(*) as count FROM Donors WHERE blood_group = %s AND is_eligible = TRUE", (blood_group,))
        result = cursor.fetchone()
        count = result['count'] if result else 0

        return jsonify({
            "status": "success",
            "message": f"🚨 Emergency alert sent to {count} eligible {blood_group} donors!",
            "donors_alerted": count
        }), 200
    finally:
        cursor.close()
        conn.close()

# --- DASHBOARD STATISTICS ---
@main_routes.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Total Donors
        cursor.execute("SELECT COUNT(*) as total_donors FROM Donors")
        donors = cursor.fetchone()['total_donors']

        # 2. Total Blood Units
        cursor.execute("SELECT SUM(quantity) as total_units FROM BloodInventory")
        units = cursor.fetchone()['total_units'] or 0

        # 3. Lives Saved (1 unit saves 3 lives)
        lives_saved = units * 3

        # 4. Data for Pie Chart (Group by blood group)
        cursor.execute("SELECT blood_group, SUM(quantity) as total FROM BloodInventory GROUP BY blood_group")
        chart_data = cursor.fetchall()

        return jsonify({
            "total_donors": donors,
            "total_units": units,
            "lives_saved": lives_saved,
            "chart_data": chart_data
        }), 200
    finally:
        cursor.close()
        conn.close()

# --- RECENT ACTIVITY & ALERTS ---
@main_routes.route('/api/recent_activity', methods=['GET'])
def recent_activity():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get last 5 donors
        cursor.execute("SELECT full_name, blood_group, created_at FROM Donors ORDER BY created_at DESC LIMIT 5")
        recent_donors = cursor.fetchall()
        for d in recent_donors: d['created_at'] = str(d['created_at'])

        # Get blood units expiring in the next 30 days (Mock logic for demo)
        cursor.execute("SELECT blood_group, component_type, expiry_date FROM BloodInventory WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY expiry_date ASC LIMIT 3")
        expiring_soon = cursor.fetchall()
        for e in expiring_soon: e['expiry_date'] = str(e['expiry_date'])

        return jsonify({
            "recent_donors": recent_donors,
            "expiring_soon": expiring_soon
        }), 200
    finally:
        cursor.close()
        conn.close()

from datetime import datetime, timedelta # Make sure this is at the top of your file!

# --- AUTOMATED COMPONENT YIELD CALCULATOR ---
@main_routes.route('/api/process_donation', methods=['POST'])
def process_donation():
    data = request.json
    blood_group = data.get('blood_group')
    quantity = int(data.get('quantity', 1)) 
    expiry_date = data.get('expiry_date') # Base expiry for RBC/Plasma

    if not all([blood_group, expiry_date]):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Medical Yield Logic: 1 Unit Whole Blood = 1 RBC + 1 Plasma + 1 Platelet
        # Platelets expire much faster (5 days), so we calculate that automatically.
        platelet_expiry = (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')

        components = [
            ('RBC', quantity, expiry_date),
            ('Plasma', quantity, expiry_date),
            ('Platelets', quantity, platelet_expiry)
        ]

        # Insert all 3 components into the inventory automatically
        for comp_type, qty, exp in components:
            cursor.execute(
                "INSERT INTO BloodInventory (blood_group, component_type, quantity, expiry_date) VALUES (%s, %s, %s, %s)",
                (blood_group, comp_type, qty, exp)
            )

        conn.commit()
        return jsonify({
            "status": "success", 
            "message": f"Successfully processed {quantity} unit(s) of {blood_group} Whole Blood into RBC, Plasma, and Platelets!"
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
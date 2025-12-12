from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import requests
from datetime import datetime
import pytz

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# orlando coordinates
ORLANDO_LAT = 28.5383
ORLANDO_LON = -81.3792

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/weather')
def get_weather():
    try:
        # using Open-Meteo API
        url = f"https://api.open-meteo.com/v1/forecast?latitude={ORLANDO_LAT}&longitude={ORLANDO_LON}&current=temperature_2m,is_day,rain,showers&daily=sunrise,sunset&timezone=America/New_York&forecast_days=1&temperature_unit=fahrenheit"
        
        response = requests.get(url)
        data = response.json()
        
        # get current time
        orlando_tz = pytz.timezone('America/New_York')
        current_time = datetime.now(orlando_tz)
        
        current = data['current']
        daily = data['daily']
        
        # check if raining
        is_raining = current.get('rain', 0) > 0 or current.get('showers', 0) > 0
        
        result = {
            'current_time': current_time.isoformat(),
            'hour': current_time.hour,
            'minute': current_time.minute,
            'is_raining': is_raining,
            'temperature': current['temperature_2m'],
            'sunrise': daily['sunrise'][0],
            'sunset': daily['sunset'][0]
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)

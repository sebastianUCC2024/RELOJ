from flask import Flask, render_template, jsonify, request
from datetime import datetime
import pytz
import locale

app = Flask(__name__, 
            static_folder='backend/static',
            template_folder='backend/templates')

# Zonas horarias disponibles con información detallada
TIMEZONES = {
    'Colombia': {
        'timezone': 'America/Bogota',
        'gmt': 'GMT-5',
        'flag': '🇨🇴',
        'city': 'Pasto',
        'locale': 'es_ES.UTF-8'  # Español
    },
    'Japan': {
        'timezone': 'Asia/Tokyo',
        'gmt': 'GMT+9',
        'flag': '🇯🇵',
        'city': 'Tokyo',
        'locale': 'ja_JP.UTF-8'  # Japonés
    },
    'Australia': {
        'timezone': 'Australia/Sydney',
        'gmt': 'GMT+11',
        'flag': '🇦🇺',
        'city': 'Sydney',
        'locale': 'en_AU.UTF-8'  # Inglés australiano
    },
    'France': {
        'timezone': 'Europe/Paris',
        'gmt': 'GMT+1',
        'flag': '🇫🇷',
        'city': 'Paris',
        'locale': 'fr_FR.UTF-8'  # Francés
    },
    'USA': {
        'timezone': 'America/New_York',
        'gmt': 'GMT-5',
        'flag': '🇺🇸',
        'city': 'New York',
        'locale': 'en_US.UTF-8'  # Inglés americano
    },
    'UK': {
        'timezone': 'Europe/London',
        'gmt': 'GMT+0',
        'flag': '🇬🇧',
        'city': 'London',
        'locale': 'en_GB.UTF-8'  # Inglés británico
    },
    'Brazil': {
        'timezone': 'America/Sao_Paulo',
        'gmt': 'GMT-3',
        'flag': '🇧🇷',
        'city': 'São Paulo',
        'locale': 'pt_BR.UTF-8'  # Portugués brasileño
    },
    'India': {
        'timezone': 'Asia/Kolkata',
        'gmt': 'GMT+5:30',
        'flag': '🇮🇳',
        'city': 'Mumbai',
        'locale': 'hi_IN.UTF-8'  # Hindi
    },
    'China': {
        'timezone': 'Asia/Shanghai',
        'gmt': 'GMT+8',
        'flag': '🇨🇳',
        'city': 'Shanghai',
        'locale': 'zh_CN.UTF-8'  # Mandarín
    },
    'Dubai': {
        'timezone': 'Asia/Dubai',
        'gmt': 'GMT+4',
        'flag': '🇦🇪',
        'city': 'Dubai',
        'locale': 'ar_AE.UTF-8'  # Árabe
    }
}

LOCALE_FORMATS = {
    'es_ES.UTF-8': {
        'months': ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
        'days': ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
    },
    'en_US.UTF-8': {
        'months': ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'],
        'days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    'zh_CN.UTF-8': {
        'months': ['一月', '二月', '三月', '四月', '五月', '六月',
                   '七月', '八月', '九月', '十月', '十一月', '十二月'],
        'days': ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
    },
    'ja_JP.UTF-8': {
        'months': ['1月', '2月', '3月', '4月', '5月', '6月',
                   '7月', '8月', '9月', '10月', '11月', '12月'],
        'days': ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日']
    },
    'fr_FR.UTF-8': {
        'months': ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                   'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        'days': ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    },
    'pt_BR.UTF-8': {
        'months': ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
        'days': ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo']
    }
}

def format_date_localized(dt, locale_code):
    """
    Formatea la fecha en el idioma correspondiente al país
    """
    try:
        locale_format = LOCALE_FORMATS.get(locale_code)
        
        if locale_format:
            day_name = locale_format['days'][dt.weekday()]
            month_name = locale_format['months'][dt.month - 1]
            
            # Formato según el idioma
            if locale_code == 'zh_CN.UTF-8':  # Chino
                return f"{dt.year}年{dt.month}月{dt.day}日 {day_name}"
            elif locale_code == 'ja_JP.UTF-8':  # Japonés
                return f"{dt.year}年{dt.month}月{dt.day}日 {day_name}"
            elif locale_code == 'en_US.UTF-8':  # Inglés americano
                return f"{day_name}, {month_name} {dt.day}, {dt.year}"
            else:  # Español, francés, portugués
                return f"{day_name}, {dt.day} de {month_name} de {dt.year}"
        else:
            # Fallback a formato por defecto
            return dt.strftime('%A, %d de %B de %Y')
    except Exception as e:
        print(f"Error formateando fecha: {e}")
        return dt.strftime('%A, %d de %B de %Y')

def get_time_info(country='Colombia'):
    """
    Obtiene la hora real del país seleccionado usando pytz
    """
    try:
        timezone_info = TIMEZONES.get(country, TIMEZONES['Colombia'])
        tz = pytz.timezone(timezone_info['timezone'])
        current_time = datetime.now(tz)
        
        hour = current_time.hour
        minute = current_time.minute
        second = current_time.second
        
        hour_12 = hour % 12
        if hour_12 == 0:
            hour_12 = 12
        am_pm = 'A.M.' if hour < 12 else 'P.M.'
        
        # Determinar si es día o noche (día: 6am-6pm, noche: 6pm-6am)
        is_day = 6 <= hour < 18
        
        # Seleccionar frase según el momento del día
        if is_day:
            phrases = [
                "¡Aprovecha el día, tus metas te esperan!",
                "Cada momento es una oportunidad para brillar",
                "Hoy es el día perfecto para lograr lo imposible",
                "Tu energía ilumina el mundo",
                "¡Conquista este día con pasión!"
            ]
        else:
            phrases = [
                "Descansa, mañana será un gran día",
                "Las estrellas brillan para ti esta noche",
                "El descanso es parte del éxito",
                "Sueña en grande, la noche es tuya",
                "Recarga energías para brillar mañana"
            ]
        
        # Seleccionar frase basada en el minuto actual para variedad
        phrase = phrases[minute % len(phrases)]
        
        formatted_date = format_date_localized(current_time, timezone_info['locale'])
        
        return {
            'hour': hour_12,  # Return 12-hour format
            'minute': minute,
            'second': second,
            'am_pm': am_pm,  # Added AM/PM indicator
            'formatted_time': f"{hour_12:02d}:{minute:02d}:{second:02d} {am_pm}",  # 12-hour format
            'formatted_date': formatted_date,  # Localized date
            'is_day': is_day,
            'period': 'day' if is_day else 'night',
            'phrase': phrase,
            'country': country,
            'city': timezone_info['city'],
            'gmt': timezone_info['gmt'],
            'flag': timezone_info['flag']
        }
    except Exception as e:
        print(f"Error obteniendo hora: {e}")
        # Fallback a hora local
        now = datetime.now()
        hour_12 = now.hour % 12
        if hour_12 == 0:
            hour_12 = 12
        am_pm = 'A.M.' if now.hour < 12 else 'P.M.'
        
        return {
            'hour': hour_12,
            'minute': now.minute,
            'second': now.second,
            'am_pm': am_pm,
            'formatted_time': f"{hour_12:02d}:{now.minute:02d}:{now.second:02d} {am_pm}",
            'formatted_date': now.strftime('%A, %d de %B de %Y'),
            'is_day': 6 <= now.hour < 18,
            'period': 'day' if 6 <= now.hour < 18 else 'night',
            'phrase': '¡Aprovecha cada momento!',
            'country': 'Colombia',
            'city': 'Pasto',
            'gmt': 'GMT-5',
            'flag': '🇨🇴'
        }

@app.route('/')
def index():
    """Ruta principal que renderiza la interfaz del reloj"""
    return render_template('index.html', timezones=TIMEZONES)

@app.route('/time')
def get_time():
    """Endpoint que retorna la hora actual en formato JSON"""
    country = request.args.get('country', 'Colombia')
    time_info = get_time_info(country)
    return jsonify(time_info)

@app.route('/time/<country>')
def get_time_by_country(country):
    """Endpoint alternativo para obtener hora por país"""
    time_info = get_time_info(country)
    return jsonify(time_info)

@app.route('/timezones')
def get_timezones():
    """Endpoint que retorna todas las zonas horarias disponibles"""
    return jsonify(TIMEZONES)

if __name__ == '__main__':
    print("🕒 Clock Exotic iniciando...")
    print("🌍 Zonas horarias disponibles:", list(TIMEZONES.keys()))
    app.run(debug=True, host='0.0.0.0', port=5000)

from cmath import log
import logging
import sys, requests, os, time, json
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_socketio import SocketIO
from werkzeug.utils import secure_filename

from logging.config import dictConfig
from flask_cors import CORS
import socket

def extract_ip():
    st = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:       
        st.connect(('10.255.255.255', 1))
        IP = st.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        st.close()
    return IP

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://flask.logging.wsgi_errors_stream',
        'formatter': 'default'
    }},
    'root': {
        'level': 'INFO',
        'handlers': ['wsgi']
    }
})
# ------------

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*') 
# gunicorn --worker-class eventlet -w 1 --threads ${THREAD} --bind ${BIND} ${MODULE}:app
# ------------
# app.config['AF']='intel'
app.config['HOST']='127.0.0.1'
app.config['PORT']='820'
app.config['TEMPLATES_AUTO_RELOAD'] = True

def webapi(cmds:list, method:str='GET', data=None):
    url = "http://{}:{}/".format(app.config['HOST'], app.config['PORT'] )
    # url = "{}:{}".format(app.config['HOST'], app.config['PORT'])
    for cmd in cmds:
        url += "/{}".format(cmd)
    return requests.get(url).text if method=='GET' else requests.post(url, data).text    

@app.route('/', methods=['GET', 'POST'])
def home():
    task_info = json.loads(webapi(['task'], 'GET'))
    # for status, task_list in task_info.items():
    #     for idx, task in enumerate(task_list):
    #         task_info[status][idx]["name"]=task["name"].replace("_", " ")
    
    # logging.info('Container status: {}'.format(webapi(['status'], 'GET')))
    return render_template('entrance.html', data=task_info)


@app.route('/temp', methods=['GET', 'POST'])
def temp():
    logging.info('\n\n')
    logging.info(request.data)
    logging.info(type(request.data))
    return redirect( url_for('home', app_data=request.data))

@app.route('/stream')
def stream():
    return render_template('stream.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/chart')
def chart():
    return render_template('charts.html')

def check_json(s):
    import json
    try:
        json.JSONDecoder(s)
        return True
    except json.JSONDecodeError:
        return False

@app.route('/add', methods=["POST"])
def test():
    print('\n\n', bool(request.form))
    if bool(request.form):
        print('Is FORM format')
        data = dict(request.form)
        print(data)
        if bool(request.files):
            print('Have source file ...')
            
            file = request.files['source']
            from werkzeug.utils import secure_filename
            file_name = secure_filename(file.filename)

            # Info
                # file.name           # Gives name
                # file.content_type   # Gives Content type text/html etc
                # file.size           # Gives file's size in byte
                # file.read()         # Reads file ( byte )
            temp_root = './temp'
            if not os.path.exists(temp_root):
                os.makedirs(temp_root)
            file_path = os.path.join(temp_root, file_name)
            file.save(file_path)
            data['source'] = file_path
        print(data)

    else:
        print('Is JSON format')
        print(request.get_json())
    # data = request.get_json()
    # print(data)
    # if 'framework' not in data.keys():
    #     data['framework']= app.config['AF']
    return "success"
    
@app.route('/remove', methods=["POST"])
def remove():
    # data = request.form.to_dict()
    print(request.get_json())
    uuid = request.form.get('uuid')
    return "success"

@app.route('/run', methods=["GET"])
def run():
    return jsonify('Done')

@app.route('/stop', methods=["GET"])
def stop():
    return jsonify('Done')

@app.route('/task/<uuid>/stream')
def app_stream(uuid):
    return render_template('stream.html')

if __name__=='__main__':
    socketio.run(app, host='0.0.0.0', port=4999, debug=True)
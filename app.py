from cmath import log
import logging
import sys, requests, os, time, json
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_socketio import SocketIO
import eventlet
from werkzeug.utils import secure_filename
eventlet.monkey_patch()  

from logging.config import dictConfig
from flask_cors import CORS

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
app.config['AF']='trt'
app.config['HOST']='http://172.16.92.130'
app.config['PORT']='5000'
app.config['TEMPLATES_AUTO_RELOAD'] = True
# ------------
def logio(msg):
    app.logger.info(msg)
    socketio.emit(event='echo', content={'echo':msg}, broadcast=True)

def webapi(cmds:list, method:str='GET', data=None):
    url = "{}:{}/{}".format(app.config['HOST'], app.config['PORT'], app.config['AF'])
    # url = "{}:{}".format(app.config['HOST'], app.config['PORT'])
    for cmd in cmds:
        url += "/{}".format(cmd)
    return requests.get(url).text if method=='GET' else requests.post(url, data).text    

@app.route('/', methods=['GET', 'POST'])
def home():
    
    if webapi(['status'], 'GET').rstrip() == 'false':
        # Run container
        logio('Running container ...')
        webapi(['run'], 'GET')
        time.sleep(1)
    else:
        logio('Container is started ...')

    app_list = webapi(['app'], 'GET')
    logio('Container status: {}'.format(webapi(['status'], 'GET')))
    
    return render_template('dashboard.html', data=json.loads(app_list))

# @app.route('/', methods=['GET', 'POST'])
# def home():
#     # Run container
#     logio('Running container ...')
#     webapi(['run'], 'GET')
#     app_list = []
#     # time.sleep(1)
#     if 'app_data' in request.args.keys():    
#         logging.info('GET DATA')
#         app_list = request.args.get('app_data')
#         logio(app_list)
#         logio(type(app_list))
#         app_list = json.loads(app_list)
#         logio(app_list)
#         logio(type(app_list))
#         # app_list = json.loads(request.data)
        
#         # logging.info(type(app_list))
#     # app_list = webapi(['app'], 'GET')
#     # logio('Container status: {}'.format(webapi(['status'], 'GET')))
#     # logging.info(type(app_list))
#     # app_list = json.loads(app_list)
#     # logging.info(type(app_list))
#     return render_template('dashboard.html', data=app_list)

@app.route('/temp', methods=['GET', 'POST'])
def temp():
    logging.info('\n\n')
    logging.info(request.data)
    logging.info(type(request.data))
    # data = json.loads(request.data) 
    # logging.info(data)
    # logging.info(type(data))
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
        print('Final way')
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

@app.route('/app/<uuid>/stream')
def app_stream(uuid):
    return render_template('flask_stream.html')

if __name__=='__main__':
    socketio.run(app, host='0.0.0.0', port=4999, debug=True)
from cmath import log
import logging
import sys, requests, os, time, json
from flask import Flask, render_template, request, jsonify, redirect, url_for
import eventlet
from werkzeug.utils import secure_filename
eventlet.monkey_patch()  

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

# app.config['AF']='intel'
app.config['HOST']='127.0.0.1'
app.config['PORT']='819'
app.config['TEMPLATES_AUTO_RELOAD'] = True

def webapi(cmds:list, method:str='GET', data=None):
    url = "http://127.0.0.1:6532/ivit"
    # url = "{}:{}".format(app.config['HOST'], app.config['PORT'])
    for cmd in cmds:
        url += "/{}".format(cmd)
    return requests.get(url).text if method=='GET' else requests.post(url, data).text    

@app.route('/', methods=['GET', 'POST'])
def home():
    task_info = json.loads(webapi(['task'], 'GET'))
    return render_template('entrance.html', data=task_info)

@app.route('/task/<uuid>/stream')
def app_stream(uuid):
    return render_template('stream.html')